import axios from 'axios';
import {
  EmbeddedDocument,
  DocumentStats,
  UpdateDocumentInput,
  DocumentPreview,
  BatchUpdateResponse,
} from '../../../../shared/types/embeddedDocuments.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

/**
 * Embedded Documents API Client
 */
export const embeddedDocumentsApi = {
  /**
   * Get all documents with optional filtering and search
   */
  getDocuments: async (
    filter?: 'all' | 'business' | 'excluded',
    search?: string
  ): Promise<EmbeddedDocument[]> => {
    const params: Record<string, string> = {};
    if (filter) params.filter = filter;
    if (search) params.search = search;

    const { data } = await axiosInstance.get<{
      success: true;
      data: EmbeddedDocument[];
    }>('/api/v1/documents', { params });

    return data.data;
  },

  /**
   * Get document statistics
   */
  getStats: async (): Promise<DocumentStats> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: DocumentStats;
    }>('/api/v1/documents/stats');

    return data.data;
  },

  /**
   * Get document by ID
   */
  getDocument: async (id: string): Promise<EmbeddedDocument> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: EmbeddedDocument;
    }>(`/api/v1/documents/${id}`);

    return data.data;
  },

  /**
   * Get document preview
   */
  getPreview: async (id: string): Promise<string> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: DocumentPreview;
    }>(`/api/v1/documents/${id}/preview`);

    return data.data.preview;
  },

  /**
   * Update document classification
   */
  updateDocument: async (
    id: string,
    updates: UpdateDocumentInput
  ): Promise<EmbeddedDocument> => {
    const { data } = await axiosInstance.patch<{
      success: true;
      data: EmbeddedDocument;
      message: string;
    }>(`/api/v1/documents/${id}`, updates);

    return data.data;
  },

  /**
   * Batch update multiple documents
   */
  batchUpdate: async (
    documentIds: string[],
    updates: UpdateDocumentInput
  ): Promise<BatchUpdateResponse> => {
    const { data } = await axiosInstance.post<{
      success: true;
      data: BatchUpdateResponse;
      message: string;
    }>('/api/v1/documents/batch-update', { documentIds, updates });

    return data.data;
  }
};
