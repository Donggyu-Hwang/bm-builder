import pool from '../utils/db';

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  parent_comment_id?: string;
  text_anchor?: string;
  content: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CommentWithUser extends Comment {
  full_name?: string;
  email?: string;
  avatar_url?: string;
  replies?: CommentWithUser[];
}

class CommentsService {
  async createComment(
    documentId: string,
    userId: string,
    content: string,
    textAnchor?: string,
    parentCommentId?: string
  ): Promise<Comment> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO comments (document_id, user_id, content, text_anchor, parent_comment_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [documentId, userId, content, textAnchor, parentCommentId]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getDocumentComments(documentId: string, userId?: string): Promise<CommentWithUser[]> {
    // Verify user has access to document
    const accessCheck = await pool.query(
      `SELECT id FROM documents WHERE id = $1 AND (user_id = $2 OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = $2 AND status = 'active'
      ) OR sharing_access IN ('anyone', 'team'))`,
      [documentId, userId]
    );

    if (userId && accessCheck.rows.length === 0) {
      throw new Error('User does not have access to this document');
    }

    // MEDIUM FIX: Fetch all comments (both parent and replies) in a single query
    const allCommentsResult = await pool.query(
      `SELECT
        c.*,
        p.full_name,
        p.email,
        p.avatar_url
       FROM comments c
       LEFT JOIN profiles p ON c.user_id = p.id
       WHERE c.document_id = $1
       ORDER BY c.parent_comment_id NULLS LAST, c.created_at ASC`,
      [documentId]
    );

    const allComments = allCommentsResult.rows;

    // Separate parent comments and replies
    const parentComments = allComments.filter((c: CommentWithUser) => !c.parent_comment_id);
    const replies = allComments.filter((c: CommentWithUser) => c.parent_comment_id);

    // Attach replies to their parent comments
    const commentsWithReplies = parentComments.map((parent: CommentWithUser) => {
      parent.replies = replies.filter((r: CommentWithUser) => r.parent_comment_id === parent.id);
      return parent;
    });

    // Sort parent comments by creation date (newest first)
    return commentsWithReplies.sort(
      (a: CommentWithUser, b: CommentWithUser) => b.created_at.getTime() - a.created_at.getTime()
    );
  }

  async updateComment(
    commentId: string,
    userId: string,
    updates: Partial<{ content: string; is_resolved: boolean }>
  ): Promise<Comment> {
    // Verify user owns the comment
    const commentCheck = await pool.query(
      'SELECT id, user_id, document_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      throw new Error('Comment not found');
    }

    const comment = commentCheck.rows[0];

    // Check if user is comment owner or document owner
    const documentCheck = await pool.query('SELECT user_id FROM documents WHERE id = $1', [
      comment.document_id,
    ]);

    if (comment.user_id !== userId && documentCheck.rows[0].user_id !== userId) {
      throw new Error('User does not have permission to update this comment');
    }

    const updatesArray: string[] = [];
    const params: (string | boolean | Date)[] = [];
    let paramCount = 0;

    if (updates.content !== undefined) {
      paramCount++;
      updatesArray.push(`content = $${paramCount}`);
      params.push(updates.content);
    }

    if (updates.is_resolved !== undefined) {
      paramCount++;
      updatesArray.push(`is_resolved = $${paramCount}`);
      params.push(updates.is_resolved);

      if (updates.is_resolved) {
        paramCount++;
        updatesArray.push(`resolved_by = $${paramCount}`);
        params.push(userId);

        paramCount++;
        updatesArray.push(`resolved_at = NOW()`);
      } else {
        paramCount++;
        updatesArray.push(`resolved_by = NULL`);
        paramCount++;
        updatesArray.push(`resolved_at = NULL`);
      }
    }

    if (updatesArray.length === 0) {
      return comment;
    }

    params.push(commentId);
    paramCount++;
    const query = `
      UPDATE comments
      SET ${updatesArray.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    // Verify user owns the comment or is document owner
    const commentCheck = await pool.query(
      `SELECT c.id, c.user_id, c.document_id, d.user_id as document_owner_id
       FROM comments c
       INNER JOIN documents d ON c.document_id = d.id
       WHERE c.id = $1`,
      [commentId]
    );

    if (commentCheck.rows.length === 0) {
      throw new Error('Comment not found');
    }

    const comment = commentCheck.rows[0];

    // Only comment owner or document owner can delete
    if (comment.user_id !== userId && comment.document_owner_id !== userId) {
      throw new Error('User does not have permission to delete this comment');
    }

    const result = await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    return (result.rowCount ?? 0) > 0;
  }

  async getCommentThread(commentId: string, _userId?: string): Promise<CommentWithUser | null> {
    // MEDIUM FIX: Fetch comment and replies in a single query to avoid N+1
    const result = await pool.query(
      `SELECT
        c.*,
        p.full_name,
        p.email,
        p.avatar_url
       FROM comments c
       LEFT JOIN profiles p ON c.user_id = p.id
       WHERE c.id = $1 OR c.parent_comment_id = $1
       ORDER BY c.parent_comment_id NULLS FIRST, c.created_at ASC`,
      [commentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const allRows = result.rows;
    const comment = allRows.find((r: CommentWithUser) => r.id === commentId);
    const replies = allRows.filter((r: CommentWithUser) => r.parent_comment_id === commentId);

    if (comment) {
      comment.replies = replies;
    }

    return comment || null;
  }
}

export default new CommentsService();
