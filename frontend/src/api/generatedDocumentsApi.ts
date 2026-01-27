/**
 * Generated Documents API
 * API client for AI-generated documents
 */

import api from './axios';

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
  created_at: string;
  updated_at: string;
  retry_attempts?: number;
  ai_provider?: string;
}

export interface GetUserDocumentsParams {
  sortBy?: 'created_at' | 'title' | 'created_at_desc' | 'created_at_asc';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocumentsResponse {
  documents: GeneratedDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const generatedDocumentsApi = {
  /**
   * Get all documents for current user
   */
  async getDocuments(params?: GetUserDocumentsParams): Promise<PaginatedDocumentsResponse> {
    const response = await api.get('/generated-documents', { params });
    return response.data;
  },

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<GeneratedDocument> {
    const response = await api.get(`/generated-documents/${id}`);
    return response.data.data;
  },

  /**
   * Get document preview
   */
  async getDocumentPreview(id: string): Promise<{
    id: string;
    title: string;
    preview: string;
    template_type: string;
    created_at: string;
  }> {
    const response = await api.get(`/generated-documents/${id}/preview`);
    return response.data.data;
  },

  /**
   * Create new document
   */
  async createDocument(data: {
    title: string;
    content?: string;
    template_type: string;
    status?: 'generating' | 'completed' | 'failed' | 'draft';
  }): Promise<GeneratedDocument> {
    const response = await api.post('/generated-documents', data);
    return response.data.data;
  },

  /**
   * Update document
   */
  async updateDocument(
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      status: 'generating' | 'completed' | 'failed' | 'draft';
      error_message: string;
      progress: number;
      progress_message: string;
    }>
  ): Promise<GeneratedDocument> {
    const response = await api.put(`/generated-documents/${id}`, updates);
    return response.data.data;
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/generated-documents/${id}`);
  },

  /**
   * Duplicate document
   */
  async duplicateDocument(id: string): Promise<GeneratedDocument> {
    const response = await api.post(`/generated-documents/${id}/duplicate`);
    return response.data.data;
  },

  /**
   * Get all documents for a team
   */
  async getTeamDocuments(
    teamId: string,
    params?: GetUserDocumentsParams
  ): Promise<PaginatedDocumentsResponse> {
    const response = await api.get(`/generated-documents/team/${teamId}`, { params });
    return response.data;
  },

  /**
   * Update document sharing settings
   */
  async updateDocumentSharing(
    id: string,
    settings: {
      team_id?: string;
      sharing_access?: 'anyone' | 'team' | 'specific';
      sharing_permission?: 'view' | 'edit' | 'comment';
      link_password?: string;
      link_expires_at?: string;
    }
  ): Promise<GeneratedDocument> {
    const response = await api.patch(`/generated-documents/${id}/sharing`, settings);
    return response.data.data;
  },

  /**
   * Get document by share link
   */
  async getSharedDocument(shareLink: string): Promise<GeneratedDocument> {
    const response = await api.get(`/generated-documents/share/${shareLink}`);
    return response.data.data;
  },
};
