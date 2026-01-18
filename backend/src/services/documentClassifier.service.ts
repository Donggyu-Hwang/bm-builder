/**
 * Document Classifier Service
 * Classifies documents as business-related based on keywords and patterns
 */

export interface FileMetadata {
  name: string;
  parents?: string[];
  mimeType?: string;
}

export class DocumentClassifierService {
  // Business-related keywords (Korean and English)
  private readonly BUSINESS_KEYWORDS = [
    '사업계획서',
    '보고서',
    '제안서',
    '계약서',
    '명세서',
    '비즈니스',
    'BM',
    'PM',
    'business',
    'plan',
    'report',
    'proposal',
    'contract',
    'specification',
    'startup',
    '창업',
    '사업',
    '기획',
    '분석'
  ];

  /**
   * Check if a file is a business document based on name and path
   * Note: Folder path classification requires additional API calls and is disabled for performance
   */
  isBusinessDocument(file: FileMetadata): boolean {
    return this.checkFileName(file.name) || this.checkFilePath(file.parents);
  }

  /**
   * Check if file name contains business keywords
   */
  private checkFileName(fileName: string): boolean {
    const normalizedName = fileName.toLowerCase();

    return this.BUSINESS_KEYWORDS.some((keyword) =>
      normalizedName.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if file path contains business folder patterns
   */
  private checkFilePath(parents?: string[]): boolean {
    if (!parents || parents.length === 0) {
      return false;
    }

    // This is a simplified check
    // In a full implementation, you would fetch parent folder names from Google Drive API
    return false;
  }

  /**
   * Detect file type from MIME type and file name
   */
  detectFileType(mimeType: string | undefined, fileName: string): 'pdf' | 'hwp' | 'docx' {
    // Check by MIME type
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'docx';
    }

    // Check by file extension
    const normalizedName = fileName.toLowerCase();

    if (normalizedName.endsWith('.pdf')) {
      return 'pdf';
    }

    if (normalizedName.endsWith('.docx')) {
      return 'docx';
    }

    if (normalizedName.endsWith('.hwp')) {
      return 'hwp';
    }

    // Default to pdf
    return 'pdf';
  }

  /**
   * Extract file size in bytes
   */
  extractFileSize(size: string | number | undefined): number {
    if (!size) {
      return 0;
    }

    if (typeof size === 'number') {
      return size;
    }

    const parsed = parseInt(size, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}

// Export singleton instance
export const documentClassifierService = new DocumentClassifierService();
