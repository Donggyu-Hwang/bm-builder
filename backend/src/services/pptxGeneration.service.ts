/**
 * PPTX Generation Service
 * Converts pitch deck documents to PowerPoint format
 */

import pool from '../utils/db';

export class PPTXGenerationService {
  /**
   * Generate PPTX from pitch deck document
   * MVP: Simple text-based slide generation
   * Future: Use pptxgenjs for proper PowerPoint generation
   */
  async generatePPTX(documentId: string, userId: string): Promise<Buffer> {
    // Get document content and slides
    const { rows: docRows } = await pool.query(
      `SELECT title, content, template_type
       FROM documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (docRows.length === 0) {
      throw new Error('Document not found');
    }

    const document = docRows[0];

    // Get slides if this is a pitch deck
    const { rows: slideRows } = await pool.query(
      `SELECT slide_number, title, content, notes
       FROM document_slides
       WHERE document_id = $1
       ORDER BY slide_number`,
      [documentId]
    );

    const slides = slideRows;

    // MVP: Generate simple text-based PPTX content
    const pptxContent = this.createSimplePPTX(document.title, slides);

    return Buffer.from(pptxContent);
  }

  /**
   * Create simple PPTX content
   * MVP implementation - returns formatted text as placeholder
   * TODO: Replace with pptxgenjs for actual PowerPoint file generation
   */
  private createSimplePPTX(title: string, slides: any[]): string {
    if (slides.length === 0) {
      // No slides found, return document content as slides
      return `
=================================================================
                      ${title}
=================================================================

이 문서는 피칭 데크용 PPT로 다운로드되었습니다.

현재 MVP 버전에서는 텍스트 형식으로 제공됩니다.
곧 실제 PowerPoint 파일(.pptx) 다운로드가 지원될 예정입니다.

=================================================================
`;
    }

    let content = `
=================================================================
                      ${title}
=================================================================

`;

    slides.forEach((slide, _index) => {
      content += `
[Slide ${slide.slide_number}: ${slide.title}]

${slide.content}

${slide.notes ? `발표자 노트: ${slide.notes}` : ''}

-----------------------------------------------------------------

`;
    });

    content += `
이 문서는 bm-builder로 생성되었습니다.
https://bm-builder.com
`;

    return content;
  }

  /**
   * Get filename for PPTX download
   */
  getPPTXFileName(title: string): string {
    const isoString = new Date().toISOString();
    const datePart = isoString.split('T')[0];
    const dateStr = datePart ? datePart.replace(/-/g, '') : '';
    return `${title}_PitchDeck_${dateStr}.pptx`;
  }
}

export const pptxGenerationService = new PPTXGenerationService();
