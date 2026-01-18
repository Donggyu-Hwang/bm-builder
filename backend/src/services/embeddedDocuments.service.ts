import pool from '../utils/db';
import {
  EmbeddedDocument,
  DocumentFilter,
  UpdateDocumentInput,
  DocumentStats,
  DocumentPreview,
} from '../../../shared/types/embeddedDocuments.types';

/**
 * Embedded Documents Service
 * Handles business logic for embedded documents management
 */
export class EmbeddedDocumentsService {
  /**
   * Get all documents for a user with optional filtering
   */
  async getUserDocuments(
    userId: string,
    filter: DocumentFilter = 'all'
  ): Promise<EmbeddedDocument[]> {
    let query = `
      SELECT id, file_id, file_name, file_type, size,
             is_business_document, is_excluded, is_deleted, created_at, updated_at
      FROM embedded_documents
      WHERE user_id = $1 AND is_deleted = false
    `;
    const params: unknown[] = [userId];

    if (filter === 'business') {
      query += ' AND is_business_document = true AND is_excluded = false';
    } else if (filter === 'excluded') {
      query += ' AND is_excluded = true';
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows as EmbeddedDocument[];
  }

  /**
   * Get document by ID
   */
  async getDocumentById(
    documentId: string,
    userId: string
  ): Promise<EmbeddedDocument | null> {
    const { rows } = await pool.query(
      `SELECT id, file_id, file_name, file_type, size,
              is_business_document, is_excluded, is_deleted, created_at, updated_at
       FROM embedded_documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as EmbeddedDocument;
  }

  /**
   * Update document classification
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updates: UpdateDocumentInput
  ): Promise<EmbeddedDocument> {
    const { rows } = await pool.query(
      `UPDATE embedded_documents
       SET is_business_document = COALESCE($1, is_business_document),
           is_excluded = COALESCE($2, is_excluded),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [
        updates.is_business_document,
        updates.is_excluded,
        documentId,
        userId,
      ]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0] as EmbeddedDocument;
  }

  /**
   * Batch update multiple documents
   */
  async batchUpdateDocuments(
    documentIds: string[],
    userId: string,
    updates: UpdateDocumentInput
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const documentId of documentIds) {
      try {
        await this.updateDocument(documentId, userId, updates);
        updated++;
      } catch (error) {
        console.error(`Failed to update document ${documentId}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }

  /**
   * Get document preview (text extraction)
   * For now, returns a placeholder. Actual text extraction will be in Story 3.2
   */
  async getDocumentPreview(
    documentId: string,
    userId: string
  ): Promise<DocumentPreview> {
    const document = await this.getDocumentById(documentId, userId);

    if (!document) {
      throw new Error('Document not found');
    }

    // Placeholder preview - actual text extraction will be in Story 3.2
    const preview = `[문서 미리보기]

파일명: ${document.file_name}
형식: ${document.file_type.toUpperCase()}
크기: ${this.formatFileSize(document.size)}

(실제 텍스트 추출은 Story 3.2에서 구현됩니다)`;

    return { preview };
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(userId: string): Promise<DocumentStats> {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE is_business_document = true AND is_excluded = false) as business,
         COUNT(*) FILTER (WHERE is_excluded = true) as excluded
       FROM embedded_documents
       WHERE user_id = $1 AND is_deleted = false`,
      [userId]
    );

    return rows[0] as DocumentStats;
  }

  /**
   * Helper: Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Search documents by filename
   * Note: searchTerm is sanitized - only alphanumeric and basic punctuation allowed
   */
  async searchDocuments(
    userId: string,
    searchTerm: string,
    filter: DocumentFilter = 'all'
  ): Promise<EmbeddedDocument[]> {
    // Sanitize search term to prevent SQL injection
    const sanitized = searchTerm.replace(/[^a-zA-Z0-9\s\-_.@]/g, '');

    let query = `
      SELECT id, file_id, file_name, file_type, size,
             is_business_document, is_excluded, is_deleted, created_at, updated_at
      FROM embedded_documents
      WHERE user_id = $1
        AND is_deleted = false
        AND file_name ILIKE $2
    `;
    const params: unknown[] = [userId, `%${sanitized}%`];

    if (filter === 'business') {
      query += ' AND is_business_document = true AND is_excluded = false';
    } else if (filter === 'excluded') {
      query += ' AND is_excluded = true';
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows as EmbeddedDocument[];
  }
}

export const embeddedDocumentsService = new EmbeddedDocumentsService();
