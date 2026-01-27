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
   * Escape special characters for ILIKE search
   * Prevents SQL injection by escaping % and _ wildcards
   */
  private escapeSearchString(input: string): string {
    return input.replace(/%/g, '\\%').replace(/_/g, '\\_');
  }

  /**
   * Get all documents for a user with filtering and sorting
   */
  async getUserDocuments(
    userId: string,
    options: GetUserDocumentsOptions = {}
  ): Promise<PaginatedDocuments> {
    const { sortBy = 'created_at_desc', search = '', page = 1, limit = 20 } = options;

    // Build the query
    let query = `
      SELECT
        id, user_id, title, content, template_type, status,
        error_message, progress, progress_message, created_at, updated_at,
        retry_attempts, ai_provider
      FROM documents
      WHERE user_id = $1
    `;

    const params: (string | number | Date)[] = [userId];
    let paramCount = 1;

    // Add search filter (CRITICAL FIX: Escape wildcards to prevent SQL injection)
    if (search && search.trim() !== '') {
      paramCount++;
      query += ` AND title ILIKE $${paramCount}`;
      // Escape % and _ to prevent wildcard injection
      const escapedSearch = this.escapeSearchString(search.trim());
      params.push(`%${escapedSearch}%`);
    }

    // Get total count for pagination
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
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

    // HIGH FIX: Sanitize and map to proper type instead of returning raw rows
    const sanitizedDocuments = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      template_type: row.template_type,
      status: row.status,
      error_message: row.error_message,
      progress: row.progress || 0,
      progress_message: row.progress_message,
      created_at: row.created_at,
      updated_at: row.updated_at,
      retry_attempts: row.retry_attempts,
      ai_provider: row.ai_provider,
    }));

    return {
      documents: sanitizedDocuments,
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
  async getDocumentPreview(
    documentId: string,
    userId: string
  ): Promise<{
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
    const values: (string | number | Date)[] = [];
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
   * HIGH FIX: Use transaction to prevent race conditions
   */
  private async saveDocumentVersion(documentId: string, userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current document content
      const { rows: docRows } = await client.query(`SELECT content FROM documents WHERE id = $1`, [
        documentId,
      ]);

      if (docRows.length === 0) {
        await client.query('ROLLBACK');
        return;
      }

      const currentContent = docRows[0].content;

      // Get next version number
      const { rows: versionRows } = await client.query(
        `SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
         FROM document_versions
         WHERE document_id = $1`,
        [documentId]
      );

      const nextVersion = versionRows[0].next_version;

      // Insert new version
      await client.query(
        `INSERT INTO document_versions (document_id, version_number, content, created_by)
         VALUES ($1, $2, $3, $4)`,
        [documentId, nextVersion, currentContent, userId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const { rowCount } = await pool.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [
      documentId,
      userId,
    ]);

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

  /**
   * Get all documents for a team
   */
  async getTeamDocuments(
    teamId: string,
    userId: string,
    options: GetUserDocumentsOptions = {}
  ): Promise<PaginatedDocuments> {
    // Verify user is a member of the team
    const memberCheck = await pool.query(
      `SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2 AND status = 'active'`,
      [teamId, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error('User is not a member of this team');
    }

    const { sortBy = 'created_at_desc', search = '', page = 1, limit = 20 } = options;

    // Build the query
    let query = `
      SELECT
        d.id, d.user_id, d.title, d.content, d.template_type, d.status,
        d.error_message, d.progress, d.progress_message, d.created_at, d.updated_at,
        d.retry_attempts, d.ai_provider, d.team_id, d.sharing_access, d.sharing_permission,
        p.full_name as owner_name, p.email as owner_email
      FROM documents d
      LEFT JOIN profiles p ON d.user_id = p.id
      WHERE d.team_id = $1
    `;

    const params: (string | number | Date)[] = [teamId];
    let paramCount = 1;

    // Add search filter (CRITICAL FIX: Escape wildcards to prevent SQL injection)
    if (search && search.trim() !== '') {
      paramCount++;
      query += ` AND d.title ILIKE $${paramCount}`;
      // Escape % and _ to prevent wildcard injection
      const escapedSearch = this.escapeSearchString(search.trim());
      params.push(`%${escapedSearch}%`);
    }

    // Get total count for pagination
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countQueryFixed = countQuery.replace(/,.*?owner_email/, ''); // Remove extra columns for count
    const countResult = await pool.query(countQueryFixed, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Add sorting
    switch (sortBy) {
      case 'title':
        query += ' ORDER BY d.title ASC';
        break;
      case 'created_at_asc':
        query += ' ORDER BY d.created_at ASC';
        break;
      case 'created_at_desc':
      default:
        query += ' ORDER BY d.updated_at DESC';
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

    // HIGH FIX: Sanitize and map to proper type instead of returning raw rows
    const sanitizedDocuments = rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      template_type: row.template_type,
      status: row.status,
      error_message: row.error_message,
      progress: row.progress || 0,
      progress_message: row.progress_message,
      created_at: row.created_at,
      updated_at: row.updated_at,
      retry_attempts: row.retry_attempts,
      ai_provider: row.ai_provider,
      team_id: row.team_id,
      sharing_access: row.sharing_access,
      sharing_permission: row.sharing_permission,
      owner_name: row.owner_name,
      owner_email: row.owner_email,
    }));

    return {
      documents: sanitizedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update document sharing settings
   */
  async updateDocumentSharing(
    documentId: string,
    userId: string,
    sharingSettings: {
      team_id?: string;
      sharing_access?: 'anyone' | 'team' | 'specific';
      sharing_permission?: 'view' | 'edit' | 'comment';
      link_password?: string;
      link_expires_at?: Date;
    }
  ): Promise<GeneratedDocument> {
    // Verify user owns the document
    const docCheck = await pool.query('SELECT id, user_id FROM documents WHERE id = $1', [
      documentId,
    ]);

    if (docCheck.rows.length === 0) {
      throw new Error('Document not found');
    }

    if (docCheck.rows[0].user_id !== userId) {
      throw new Error('Only document owner can update sharing settings');
    }

    // Build update query
    const updates: string[] = [];
    const params: (string | Date | null)[] = [];
    let paramCount = 0;

    if (sharingSettings.team_id !== undefined) {
      paramCount++;
      updates.push(`team_id = $${paramCount}`);
      params.push(sharingSettings.team_id);
    }

    if (sharingSettings.sharing_access !== undefined) {
      paramCount++;
      updates.push(`sharing_access = $${paramCount}`);
      params.push(sharingSettings.sharing_access);
    }

    if (sharingSettings.sharing_permission !== undefined) {
      paramCount++;
      updates.push(`sharing_permission = $${paramCount}`);
      params.push(sharingSettings.sharing_permission);
    }

    if (sharingSettings.link_password !== undefined) {
      paramCount++;
      updates.push(`link_password = $${paramCount}`);
      params.push(sharingSettings.link_password);
    }

    if (sharingSettings.link_expires_at !== undefined) {
      paramCount++;
      updates.push(`link_expires_at = $${paramCount}`);
      params.push(sharingSettings.link_expires_at);
    }

    if (updates.length === 0) {
      return this.getDocument(documentId, userId);
    }

    // Generate share link if sharing_access is 'anyone' and no link exists
    const linkResult = await pool.query('SELECT shared_link FROM documents WHERE id = $1', [
      documentId,
    ]);

    if (sharingSettings.sharing_access === 'anyone' && !linkResult.rows[0].shared_link) {
      const { randomBytes } = await import('crypto');
      const shareLink = randomBytes(16).toString('hex');
      paramCount++;
      updates.push(`shared_link = $${paramCount}`);
      params.push(shareLink);
    }

    params.push(documentId);
    paramCount++;
    const query = `
      UPDATE documents
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await pool.query(query, params);
    return rows[0];
  }

  /**
   * Get document by share link
   */
  async getDocumentByShareLink(shareLink: string): Promise<GeneratedDocument | null> {
    const { rows } = await pool.query(
      `SELECT
        d.id, d.user_id, d.title, d.content, d.template_type, d.status,
        d.error_message, d.progress, d.progress_message, d.created_at, d.updated_at,
        d.retry_attempts, d.ai_provider, d.team_id, d.sharing_access, d.sharing_permission,
        d.link_expires_at, p.full_name as owner_name, p.email as owner_email
      FROM documents d
      LEFT JOIN profiles p ON d.user_id = p.id
      WHERE d.shared_link = $1
        AND d.sharing_access IN ('anyone', 'team')
        AND (d.link_expires_at IS NULL OR d.link_expires_at > NOW())`,
      [shareLink]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Check for document changes since a given timestamp
   */
  async getDocumentChanges(
    documentId: string,
    userId: string,
    since: Date
  ): Promise<{
    hasChanges: boolean;
    updated_at?: Date;
    updated_by?: string;
    sections_count?: number;
  }> {
    // Verify user has access to document
    const accessCheck = await pool.query(
      `SELECT id FROM documents WHERE id = $1 AND (user_id = $2 OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = $2 AND status = 'active'
      ) OR sharing_access IN ('anyone', 'team'))`,
      [documentId, userId]
    );

    if (accessCheck.rows.length === 0) {
      throw new Error('User does not have access to this document');
    }

    const result = await pool.query(
      `SELECT
        updated_at,
        user_id,
        (SELECT COUNT(*) FROM document_slides WHERE document_id = $1) as sections_count
       FROM documents
       WHERE id = $1 AND updated_at > $2`,
      [documentId, since]
    );

    if (result.rows.length === 0) {
      return { hasChanges: false };
    }

    return {
      hasChanges: true,
      updated_at: result.rows[0].updated_at,
      updated_by: result.rows[0].user_id,
      sections_count: result.rows[0].sections_count,
    };
  }
}

// Export singleton instance
export const documentsService = new DocumentsService();
