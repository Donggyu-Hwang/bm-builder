/**
 * Embedded Documents Types
 * Types for embedded documents from Google Drive scanning
 */

/**
 * File type enum
 */
export type FileType = 'pdf' | 'docx' | 'hwp';

/**
 * Document filter type
 */
export type DocumentFilter = 'all' | 'business' | 'excluded';

/**
 * Embedded document entity
 */
export interface EmbeddedDocument {
  id: string;
  file_id: string;
  file_name: string;
  file_type: FileType;
  size: number;
  is_business_document: boolean;
  is_excluded: boolean;
  is_deleted: boolean;
  last_synced_at: Date;
  google_modified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Document statistics
 */
export interface DocumentStats {
  total: number;
  business: number;
  excluded: number;
}

/**
 * Update document input
 */
export interface UpdateDocumentInput {
  is_business_document?: boolean;
  is_excluded?: boolean;
}

/**
 * Document preview response
 */
export interface DocumentPreview {
  preview: string;
}

/**
 * Batch update request
 */
export interface BatchUpdateRequest {
  documentIds: string[];
  updates: UpdateDocumentInput;
}

/**
 * Batch update response
 */
export interface BatchUpdateResponse {
  updated: number;
  failed: number;
  errors?: Array<{
    documentId: string;
    error: string;
  }>;
}
