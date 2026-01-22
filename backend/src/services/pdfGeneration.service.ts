/**
 * PDF Generation Service
 * Converts documents to PDF format
 */

import pool from '../utils/db';

export class PDFGenerationService {
  /**
   * Generate PDF from document content
   * MVP: Simple text-based PDF generation
   * Future: Use Puppeteer for HTML-to-PDF conversion
   */
  async generatePDF(documentId: string, userId: string): Promise<Buffer> {
    // Get document content
    const { rows } = await pool.query(
      `SELECT title, content, template_type, created_at
       FROM documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    const document = rows[0];

    // MVP: Return a placeholder PDF buffer
    // In production, use Puppeteer to convert HTML to PDF
    const pdfContent = this.createSimplePDF(document);

    return Buffer.from(pdfContent);
  }

  /**
   * Create simple PDF content
   * MVP implementation - returns formatted text
   * TODO: Replace with Puppeteer HTML-to-PDF conversion
   */
  private createSimplePDF(document: {
    title: string;
    content: string;
    template_type: string;
    created_at: Date;
  }): string {
    const dateStr = new Date(document.created_at).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Simple text-based PDF placeholder
    return `
=================================================================
                    ${document.title}
=================================================================

생성일: ${dateStr}
템플릿: ${document.template_type}

-----------------------------------------------------------------

${document.content}

-----------------------------------------------------------------

이 문서는 bm-builder로 생성되었습니다.
https://bm-builder.com
`;
  }

  /**
   * Get filename for PDF download
   */
  getPDFFileName(title: string): string {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `${title}_${dateStr}.pdf`;
  }
}

export const pdfGenerationService = new PDFGenerationService();
