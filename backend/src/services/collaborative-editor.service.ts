/**
 * Collaborative Editor Service
 * Manages Yjs documents for real-time collaborative editing
 * Persists documents to database to prevent data loss on server restart
 */

import * as Y from 'yjs';
import pool from '../utils/db';

export interface DocumentState {
  id: string;
  ydoc: Y.Doc;
  content: Y.Text;
  lastModified: Date;
  lastSaved?: Date; // Track when document was last saved to DB
}

class CollaborativeEditorService {
  private documents: Map<string, DocumentState> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_DOCUMENTS = 1000; // Memory limit
  private readonly DOCUMENT_TTL = 3600000; // 1 hour

  // Track document access for eviction
  private lastAccessed: Map<string, Date> = new Map();

  constructor() {
    // Start auto-save interval
    this.startAutoSave();
  }

  /**
   * Get or create a Yjs document for collaborative editing
   * Loads from database if not in memory
   */
  async getDocument(documentId: string): Promise<DocumentState> {
    // Clean up old documents before access
    this.evictStaleDocuments();

    if (!this.documents.has(documentId)) {
      // Try to load from database first
      const loaded = await this.loadFromDatabase(documentId);
      if (loaded) {
        this.documents.set(documentId, loaded);
        this.lastAccessed.set(documentId, new Date());
        return loaded;
      }

      // Create new document if not in database
      const ydoc = new Y.Doc();
      const content = ydoc.getText('content');

      this.documents.set(documentId, {
        id: documentId,
        ydoc,
        content,
        lastModified: new Date(),
      });
      this.lastAccessed.set(documentId, new Date());
    } else {
      // Update last accessed time
      this.lastAccessed.set(documentId, new Date());
    }

    return this.documents.get(documentId)!;
  }

  /**
   * Synchronous version for backward compatibility
   * Prefer async getDocument() for new code
   */
  getDocumentSync(documentId: string): DocumentState {
    if (!this.documents.has(documentId)) {
      const ydoc = new Y.Doc();
      const content = ydoc.getText('content');

      this.documents.set(documentId, {
        id: documentId,
        ydoc,
        content,
        lastModified: new Date(),
      });
      this.lastAccessed.set(documentId, new Date());
    } else {
      this.lastAccessed.set(documentId, new Date());
    }

    return this.documents.get(documentId)!;
  }

  /**
   * Apply an update to a document
   */
  applyUpdate(documentId: string, update: Uint8Array): string {
    const doc = this.getDocumentSync(documentId);
    Y.applyUpdate(doc.ydoc, update);
    doc.lastModified = new Date();
    return doc.content.toString();
  }

  /**
   * Get current document content as string
   */
  getContent(documentId: string): string {
    const doc = this.getDocumentSync(documentId);
    return doc.content.toString();
  }

  /**
   * Get document state as update (for sync)
   */
  getState(documentId: string): Uint8Array {
    const doc = this.getDocumentSync(documentId);
    return Y.encodeStateAsUpdate(doc.ydoc);
  }

  /**
   * Conflict Resolution Strategy:
   * --------------------------------
   * This service uses Yjs CRDT with Y.Text algorithm for conflict-free collaboration.
   *
   * Merge Behavior:
   * - Concurrent edits are automatically merged without conflicts
   * - Last operation wins for overlapping character ranges
   * - No manual merge required for text content
   *
   * For non-automergeable conflicts (e.g., structure changes, formatting):
   * - Users should use the version history to resolve manually
   * - See Story 8-5: Manual merge UI (pending implementation)
   *
   * Yjs guarantees:
   * - No data loss
   * - Eventual consistency across all clients
   * - Automatic conflict resolution
   */

  /**
   * Set document content from string
   */
  async setContent(documentId: string, content: string): Promise<void> {
    const doc = await this.getDocument(documentId);
    doc.content.delete(0, doc.content.length);
    doc.content.insert(0, content);
    doc.lastModified = new Date();
  }

  /**
   * Initialize document from existing content
   */
  initializeDocument(documentId: string, initialContent: string): void {
    if (!this.documents.has(documentId)) {
      const ydoc = new Y.Doc();
      const content = ydoc.getText('content');
      content.insert(0, initialContent);

      this.documents.set(documentId, {
        id: documentId,
        ydoc,
        content,
        lastModified: new Date(),
      });
    }
  }

  /**
   * Process a text insertion
   */
  async insertText(documentId: string, index: number, text: string): Promise<string> {
    const doc = await this.getDocument(documentId);
    doc.content.insert(index, text);
    doc.lastModified = new Date();
    return doc.content.toString();
  }

  /**
   * Process a text deletion
   */
  async deleteText(documentId: string, index: number, length: number): Promise<string> {
    const doc = await this.getDocument(documentId);
    doc.content.delete(index, length);
    doc.lastModified = new Date();
    return doc.content.toString();
  }

  /**
   * Process a text replacement
   */
  async replaceText(
    documentId: string,
    index: number,
    length: number,
    text: string
  ): Promise<string> {
    const doc = await this.getDocument(documentId);
    doc.content.delete(index, length);
    doc.content.insert(index, text);
    doc.lastModified = new Date();
    return doc.content.toString();
  }

  /**
   * Get document as JSON for storage
   */
  async toJSON(documentId: string): Promise<{ content: string; lastModified: string }> {
    const doc = await this.getDocument(documentId);
    return {
      content: doc.content.toString(),
      lastModified: doc.lastModified.toISOString(),
    };
  }

  /**
   * Clean up a document
   */
  cleanupDocument(documentId: string): void {
    const doc = this.documents.get(documentId);
    if (doc) {
      doc.ydoc.destroy();
      this.documents.delete(documentId);
    }
  }

  /**
   * Get all active documents
   */
  getActiveDocuments(): string[] {
    return Array.from(this.documents.keys());
  }

  /**
   * Check if document exists in memory
   */
  hasDocument(documentId: string): boolean {
    return this.documents.has(documentId);
  }

  /**
   * Save document to database (creates new version)
   */
  async saveToDatabase(documentId: string, userId?: string): Promise<void> {
    const doc = this.documents.get(documentId);
    if (!doc) {
      return;
    }

    const content = doc.content.toString();

    try {
      await pool.query(
        `INSERT INTO document_versions (document_id, version_number, content, created_by)
         VALUES ($1, (
           SELECT COALESCE(MAX(version_number), 0) + 1
           FROM document_versions
           WHERE document_id = $1
         ), $2, $3)`,
        [documentId, content, userId || null]
      );

      doc.lastSaved = new Date();
      console.log(`Saved document ${documentId} to database`);
    } catch (error) {
      console.error(`Failed to save document ${documentId}:`, error);
    }
  }

  /**
   * Load latest document version from database
   */
  private async loadFromDatabase(documentId: string): Promise<DocumentState | null> {
    try {
      const result = await pool.query(
        `SELECT content, created_at
         FROM document_versions
         WHERE document_id = $1
         ORDER BY version_number DESC
         LIMIT 1`,
        [documentId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const ydoc = new Y.Doc();
      const content = ydoc.getText('content');
      content.insert(0, row.content);

      return {
        id: documentId,
        ydoc,
        content,
        lastModified: row.created_at,
        lastSaved: row.created_at,
      };
    } catch (error) {
      console.error(`Failed to load document ${documentId}:`, error);
      return null;
    }
  }

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      return;
    }

    this.autoSaveInterval = setInterval(async () => {
      const now = Date.now();
      const docsToSave: string[] = [];

      // Find documents that need saving
      for (const [docId, doc] of this.documents.entries()) {
        const lastModified = doc.lastModified.getTime();
        const lastSaved = doc.lastSaved?.getTime() || 0;

        // Save if modified more than 30 seconds ago
        if (lastModified > lastSaved && now - lastModified > this.AUTO_SAVE_INTERVAL_MS) {
          docsToSave.push(docId);
        }
      }

      // Save documents
      for (const docId of docsToSave) {
        await this.saveToDatabase(docId);
      }
    }, this.AUTO_SAVE_INTERVAL_MS);

    console.log('Auto-save interval started');
  }

  /**
   * Evict stale documents from memory
   */
  private evictStaleDocuments(): void {
    const now = new Date();

    for (const [docId, lastAccess] of this.lastAccessed) {
      const doc = this.documents.get(docId);

      // Evict if:
      // 1. Too many documents in memory, OR
      // 2. Document hasn't been accessed in TTL period
      const shouldEvict =
        this.documents.size > this.MAX_DOCUMENTS ||
        now.getTime() - lastAccess.getTime() > this.DOCUMENT_TTL;

      if (shouldEvict && doc) {
        // Save to database before evicting
        this.saveToDatabase(docId);

        // Clean up
        doc.ydoc.destroy();
        this.documents.delete(docId);
        this.lastAccessed.delete(docId);

        console.log(`Evicted document ${docId} from memory`);
      }
    }
  }

  /**
   * Save all documents before shutdown
   */
  async saveAll(): Promise<void> {
    console.log('Saving all documents before shutdown...');

    const savePromises: Promise<void>[] = [];
    for (const docId of this.documents.keys()) {
      savePromises.push(this.saveToDatabase(docId));
    }

    await Promise.all(savePromises);
    console.log('All documents saved');
  }
}

export const collaborativeEditorService = new CollaborativeEditorService();
export default collaborativeEditorService;
