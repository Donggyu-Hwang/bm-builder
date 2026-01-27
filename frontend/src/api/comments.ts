import api from './axios';

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  parent_comment_id?: string;
  text_anchor?: string;
  content: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  full_name?: string;
  email?: string;
  avatar_url?: string;
  replies?: CommentWithUser[];
}

class CommentsService {
  async getDocumentComments(documentId: string): Promise<CommentWithUser[]> {
    const response = await api.get(`/comments/document/${documentId}`);
    return response.data.data;
  }

  async getCommentThread(commentId: string): Promise<CommentWithUser> {
    const response = await api.get(`/comments/thread/${commentId}`);
    return response.data.data;
  }

  async createComment(data: {
    document_id: string;
    content: string;
    text_anchor?: string;
    parent_comment_id?: string;
  }): Promise<Comment> {
    const response = await api.post('/comments', data);
    return response.data.data;
  }

  async updateComment(
    commentId: string,
    updates: { content?: string; is_resolved?: boolean }
  ): Promise<Comment> {
    const response = await api.patch(`/comments/${commentId}`, updates);
    return response.data.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }
}

export default new CommentsService();
