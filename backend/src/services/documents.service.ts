/**
 * Documents Service
 * Handles CRUD operations for AI-generated documents
 */

import pool from '../utils/db';

export interface GeneratedDocument {
  id: string;
  user_id: string;
  title: string;
  content: string;
  template_type: string;
  status: 'generating' | 'completed' | 'failed' | 'draft';
  error_message?: string;
  progress: number;
  progress_message?: string;
  created_at: Date;
  updated_at: Date;
  retry_attempts?: number;
  ai_provider?: string;
}

export interface GetUserDocumentsOptions {
  sortBy?: 'created_at' | 'title' | 'created_at_desc' | 'created_at_asc';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocuments {
  documents: GeneratedDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DocumentsService {
  /**
   * Get all documents for a user with filtering and sorting
   */
  async getUserDocuments(
    userId: string,
    options: GetUserDocumentsOptions = {}
  ): Promise<PaginatedDocuments> {
    const {
      sortBy = 'created_at_desc',
      search = '',
      page = 1,
      limit = 20,
    } = options;

    // Build the query
    let query = `
      SELECT
        id, user_id, title, content, template_type, status,
        error_message, progress, progress_message, created_at, updated_at,
        retry_attempts, ai_provider
      FROM documents
      WHERE user_id = $1
    `;

    const params: any[] = [userId];
    let paramCount = 1;

    // Add search filter
    if (search && search.trim() !== '') {
      paramCount++;
      query += ` AND title ILIKE $${paramCount}`;
      params.push(`%${search.trim()}%`);
    }

    // Get total count for pagination
    const countQuery = query.replace(
      /SELECT.*?FROM/,
      'SELECT COUNT(*) as total FROM'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Add sorting
    switch (sortBy) {
      case 'title':
        query += ' ORDER BY title ASC';
        break;
      case 'created_at_asc':
        query += ' ORDER BY created_at ASC';
        break;
      case 'created_at_desc':
      default:
        query += ' ORDER BY created_at DESC';
        break;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(limit, offset);

    // Execute query
    const { rows } = await pool.query(query, params);

    return {
      documents: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single document by ID
   */
  async getDocument(documentId: string, userId: string): Promise<GeneratedDocument> {
    const { rows } = await pool.query(
      `SELECT
        id, user_id, title, content, template_type, status,
        error_message, progress, progress_message, created_at, updated_at,
        retry_attempts, ai_provider
      FROM documents
      WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0];
  }

  /**
   * Get document preview (first 200 characters)
   */
  async getDocumentPreview(documentId: string, userId: string): Promise<{
    id: string;
    title: string;
    preview: string;
    template_type: string;
    created_at: Date;
  }> {
    const document = await this.getDocument(documentId, userId);

    return {
      id: document.id,
      title: document.title,
      preview: document.content.substring(0, 200) + (document.content.length > 200 ? '...' : ''),
      template_type: document.template_type,
      created_at: document.created_at,
    };
  }

  /**
   * Create a new document
   */
  async createDocument(
    userId: string,
    documentData: {
      title: string;
      content?: string;
      template_type: string;
      status?: 'generating' | 'completed' | 'failed' | 'draft';
    }
  ): Promise<GeneratedDocument> {
    const { title, content = '', template_type, status = 'draft' } = documentData;

    const { rows } = await pool.query(
      `INSERT INTO documents (user_id, title, content, template_type, status, progress)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING *`,
      [userId, title, content, template_type, status]
    );

    return rows[0];
  }

  /**
   * Update an existing document
   */
  async updateDocument(
    documentId: string,
    userId: string,
    updates: Partial<{
      title: string;
      content: string;
      status: 'generating' | 'completed' | 'failed' | 'draft';
      error_message: string;
      progress: number;
      progress_message: string;
    }>
  ): Promise<GeneratedDocument> {
    // If content is being updated, save version first
    if (updates.content !== undefined) {
      await this.saveDocumentVersion(documentId, userId);
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (updates.title !== undefined) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      values.push(updates.title);
    }

    if (updates.content !== undefined) {
      paramCount++;
      updateFields.push(`content = $${paramCount}`);
      values.push(updates.content);
    }

    if (updates.status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      values.push(updates.status);
    }

    if (updates.error_message !== undefined) {
      paramCount++;
      updateFields.push(`error_message = $${paramCount}`);
      values.push(updates.error_message);
    }

    if (updates.progress !== undefined) {
      paramCount++;
      updateFields.push(`progress = $${paramCount}`);
      values.push(updates.progress);
    }

    if (updates.progress_message !== undefined) {
      paramCount++;
      updateFields.push(`progress_message = $${paramCount}`);
      values.push(updates.progress_message);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add documentId and userId to params
    paramCount++;
    values.push(documentId);
    paramCount++;
    values.push(userId);

    const query = `
      UPDATE documents
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0];
  }

  /**
   * Save document version before updating
   */
  private async saveDocumentVersion(documentId: string, userId: string): Promise<void> {
    // Get current document content
    const { rows: docRows } = await pool.query(
      `SELECT content FROM documents WHERE id = $1`,
      [documentId]
    );

    if (docRows.length === 0) {
      return;
    }

    const currentContent = docRows[0].content;

    // Get next version number
    const { rows: versionRows } = await pool.query(
      `SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
       FROM document_versions
       WHERE document_id = $1`,
      [documentId]
    );

    const nextVersion = versionRows[0].next_version;

    // Insert new version
    await pool.query(
      `INSERT INTO document_versions (document_id, version_number, content, created_by)
       VALUES ($1, $2, $3, $4)`,
      [documentId, nextVersion, currentContent, userId]
    );
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const { rowCount } = await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (rowCount === 0) {
      throw new Error('Document not found');
    }
  }

  /**
   * Duplicate a document
   */
  async duplicateDocument(documentId: string, userId: string): Promise<GeneratedDocument> {
    const original = await this.getDocument(documentId, userId);

    const { rows } = await pool.query(
      `INSERT INTO documents (user_id, title, content, template_type, status, progress)
       SELECT $1, $2, content, template_type, 'draft', 0
       FROM documents
       WHERE id = $3
       RETURNING *`,
      [userId, `${original.title} (복제)`, documentId]
    );

    return rows[0];
  }
}

// Export singleton instance
export const documentsService = new DocumentsService();
