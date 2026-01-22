/**
 * Pitch Deck Service
 * Handles generation and management of pitch deck slides
 */

import pool from '../utils/db';
import { claudeService } from './claude.service';
import { ragService } from './rag.service';

export interface GeneratePitchDeckParams {
  userId: string;
  answers: Record<string, string>;
}

export interface Slide {
  id: string;
  document_id: string;
  slide_number: number;
  title: string;
  content: string;
  figure_id?: string;
  notes?: string;
  created_at: Date;
}

export class PitchDeckService {
  /**
   * Generate a complete pitch deck
   */
  async generatePitchDeck(params: GeneratePitchDeckParams): Promise<string> {
    // Create document record
    const { rows: docRows } = await pool.query(
      `INSERT INTO documents (user_id, title, template_type, status, progress, progress_message)
       VALUES ($1, $2, 'pitch_deck', 'generating', 0, '피칭 데크 생성 중...')
       RETURNING id`,
      [params.userId, '피칭 데크']
    );

    const documentId = docRows[0].id;

    // Generate slides in background
    this.generateSlidesInBackground(documentId, params.answers).catch((error) => {
      console.error('Pitch deck generation failed:', error);
      this.updateDocumentStatus(documentId, 'failed', error.message);
    });

    return documentId;
  }

  /**
   * Generate slides in background
   */
  private async generateSlidesInBackground(
    documentId: string,
    answers: Record<string, string>
  ): Promise<void> {
    try {
      // Update progress
      await this.updateProgress(documentId, 10, '질문 분석 중...');

      // Extract keywords for context
      const keywords = ragService.extractKeywords(answers);
      await this.updateProgress(documentId, 20, '키워드 추출 완료');

      // Search for similar documents
      await this.updateProgress(documentId, 30, '관련 문서 검색 중...');
      const similarDocs = await ragService.searchSimilarDocuments(
        documentId.split('-')[0], // Extract userId from documentId (simplified)
        keywords,
        3
      );
      const context = ragService.buildContext(similarDocs);

      await this.updateProgress(documentId, 40, '문서 검색 완료');

      // Generate slides with Claude
      await this.updateProgress(documentId, 50, '슬라이드 생성 중...');

      const systemPrompt = `You are an expert pitch deck creator for Korean startups.
Generate 10-15 slides following standard pitch deck structure.
Each slide should have a clear title and 3-5 bullet points.
Keep content concise and impactful.
Format as markdown with slide separators.

Required slide structure:
1. Title & Tagline
2. Problem (The Problem)
3. Solution (Our Solution)
4. Market Opportunity (Market Size)
5. Product (Product/Service)
6. Business Model (How We Make Money)
7. Traction (Achievements & Growth)
8. Competition (Competitive Landscape)
9. Team (Team Members)
10. Financials (Financial Projections)
11-15. Appendix (Additional Details)

Language: Korean
Tone: Professional, confident, persuasive`;

      const userPrompt = this.buildUserPrompt(answers, context);

      const generatedContent = await claudeService.generateDocument({
        systemPrompt,
        userMessages: [userPrompt],
        maxTokens: 8192,
      });

      await this.updateProgress(documentId, 80, '슬라이드 파싱 중...');

      // Parse and save slides
      await this.parseAndSaveSlides(documentId, generatedContent);

      await this.updateProgress(documentId, 100, '완료');

      // Update document status
      await pool.query(
        `UPDATE documents
         SET status = 'completed', content = $1
         WHERE id = $2`,
        [generatedContent, documentId]
      );
    } catch (error) {
      console.error('Pitch deck generation error:', error);
      throw error;
    }
  }

  /**
   * Build user prompt from answers and context
   */
  private buildUserPrompt(
    answers: Record<string, string>,
    context: string
  ): string {
    const answersText = Object.entries(answers)
      .map(([questionNum, answer]) => `Q${questionNum}: ${answer}`)
      .join('\n\n');

    return `Create a professional pitch deck based on these interview responses:

${answersText}

${context ? `Relevant Context from User's Documents:\n${context}\n` : ''}

Generate slides in the following markdown format:

---
## SLIDE 1: Title & Tagline

**Company Name**: [회사명]
**Tagline**: [한 줄 요약]

---

## SLIDE 2: Problem

**The Problem**

- [문제점 1]
- [문제점 2]
- [문제점 3]

---

[Continue for all 10-15 required slides]

---

Make sure to create exactly 10-15 slides covering all required sections.`;
  }

  /**
   * Parse generated content and save slides
   */
  private async parseAndSaveSlides(
    documentId: string,
    content: string
  ): Promise<void> {
    // Split by slide markers
    const slideMarkers = content.split(/---+\n## SLIDE \d+:/);

    // First slide (before first marker)
    if (slideMarkers.length > 0 && slideMarkers[0].trim()) {
      const firstSlide = this.extractSlideInfo(slideMarkers[0], 'Title & Tagline');
      if (firstSlide) {
        await this.saveSlide(documentId, 1, firstSlide.title, firstSlide.content);
      }
    }

    // Remaining slides
    for (let i = 1; i < slideMarkers.length; i++) {
      const slideContent = slideMarkers[i];
      const slideInfo = this.extractSlideInfo(slideContent, `Slide ${i + 1}`);

      if (slideInfo) {
        await this.saveSlide(documentId, i + 1, slideInfo.title, slideInfo.content);
      }
    }
  }

  /**
   * Extract slide title and content
   */
  private extractSlideInfo(
    content: string,
    defaultTitle: string
  ): { title: string; content: string } | null {
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return null;
    }

    // First line is usually the title
    let title = defaultTitle;
    let contentStart = 0;

    const firstLine = lines[0].trim();
    if (firstLine.startsWith('**') && firstLine.endsWith('**')) {
      title = firstLine.replace(/\*\*/g, '').trim();
      contentStart = 1;
    }

    const content = lines.slice(contentStart).join('\n').trim();

    return { title, content: content || '내용 준비 중...' };
  }

  /**
   * Save slide to database
   */
  private async saveSlide(
    documentId: string,
    slideNumber: number,
    title: string,
    content: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO document_slides (document_id, slide_number, title, content)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (document_id, slide_number)
       DO UPDATE SET title = $3, content = $4`,
      [documentId, slideNumber, title, content]
    );
  }

  /**
   * Get all slides for a document
   */
  async getSlides(documentId: string): Promise<Slide[]> {
    const { rows } = await pool.query(
      `SELECT * FROM document_slides
       WHERE document_id = $1
       ORDER BY slide_number ASC`,
      [documentId]
    );

    return rows as Slide[];
  }

  /**
   * Reorder slide (change slide number)
   */
  async reorderSlide(slideId: string, newOrder: number): Promise<void> {
    await pool.query(
      `UPDATE document_slides
       SET slide_number = $1
       WHERE id = $2`,
      [newOrder, slideId]
    );
  }

  /**
   * Update slide content
   */
  async updateSlide(
    slideId: string,
    updates: {
      title?: string;
      content?: string;
      notes?: string;
    }
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }

    if (updates.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(updates.content);
    }

    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(slideId);

    await pool.query(
      `UPDATE document_slides
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}`,
      values
    );
  }

  /**
   * Delete slide
   */
  async deleteSlide(slideId: string): Promise<void> {
    await pool.query('DELETE FROM document_slides WHERE id = $1', [slideId]);
  }

  /**
   * Update document progress
   */
  private async updateProgress(
    documentId: string,
    progress: number,
    message: string
  ): Promise<void> {
    await pool.query(
      `UPDATE documents
       SET progress = $1, progress_message = $2, updated_at = NOW()
       WHERE id = $3`,
      [progress, message, documentId]
    );
  }

  /**
   * Update document status
   */
  private async updateDocumentStatus(
    documentId: string,
    status: 'completed' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    await pool.query(
      `UPDATE documents
       SET status = $1, error_message = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, errorMessage || null, documentId]
    );
  }
}

// Export singleton instance
export const pitchDeckService = new PitchDeckService();
