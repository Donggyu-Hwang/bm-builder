/**
 * Document Generation Service
 * Handles end-to-end document generation with RAG and Claude API
 */

import pool from '../utils/db';
import { claudeWithFallbackService } from './claudeWithFallback.service';
import { ragService } from './rag.service';
import { figureService } from './figure.service';
import { getSystemPrompt } from '../config/templatePrompts';

export interface GenerateDocumentParams {
  userId: string;
  templateType: string;
  answers: Record<string, string>;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  title: string;
  content: string;
  template_type: string;
  status: 'generating' | 'completed' | 'failed';
  error_message?: string;
  progress: number;
  progress_message?: string;
  created_at: Date;
  updated_at: Date;
}

export class DocumentGenerationService {
  /**
   * Generate a document (starts background process)
   */
  async generateDocument(params: GenerateDocumentParams): Promise<string> {
    const { userId, templateType, answers } = params;

    // Create document record
    const { rows: docRows } = await pool.query(
      `INSERT INTO documents (user_id, title, template_type, status, progress, progress_message)
       VALUES ($1, $2, $3, 'generating', 0, 'AI가 질문을 분석 중...')
       RETURNING id`,
      [userId, `새 문서 - ${templateType}`, templateType]
    );

    const documentId = docRows[0].id;

    // Start generation in background
    this.generateInBackground(documentId, params).catch((error) => {
      console.error('Document generation failed:', error);
      this.updateDocumentStatus(documentId, 'failed', error.message);
    });

    return documentId;
  }

  /**
   * Background process for document generation
   */
  private async generateInBackground(
    documentId: string,
    params: GenerateDocumentParams
  ): Promise<void> {
    try {
      // Stage 1: Analyze questions (0-30%)
      await this.updateProgress(documentId, 10, 'AI가 질문을 분석 중...');

      const keywords = ragService.extractKeywords(params.answers);
      await this.updateProgress(documentId, 30, '키워드 추출 완료');

      // Stage 2: Search similar documents (30-60%)
      await this.updateProgress(documentId, 35, '관련 문서를 검색 중...');

      const similarDocs = await ragService.searchSimilarDocuments(
        params.userId,
        keywords,
        5
      );

      const context = ragService.buildContext(similarDocs);
      await this.updateProgress(documentId, 60, '문서 검색 완료');

      // Stage 3: Generate document with Claude (60-90%)
      await this.updateProgress(documentId, 65, '문서를 생성 중...');

      const systemPrompt = this.buildSystemPrompt(params.templateType);
      const userContent = this.buildUserPrompt(params.answers, context);

      // Use fallback service with retry and circuit breaker
      const result = await claudeWithFallbackService.generateWithRetry({
        systemPrompt,
        userMessages: [userContent],
        maxTokens: 8192,
        documentId,
      });

      const generatedContent = result.content;

      // Update AI provider used
      await pool.query(
        `UPDATE documents SET ai_provider = $1 WHERE id = $2`,
        [result.provider, documentId]
      );

      // Stage 4: Generate figures (90-95%)
      await this.updateProgress(documentId, 92, '인포그래픽 생성 중...');

      const figureOpportunities = figureService.identifyFigureOpportunities(
        generatedContent
      );

      // Create figure records
      for (let i = 0; i < figureOpportunities.length; i++) {
        const opportunity = figureOpportunities[i];
        const placeholder = figureService.generateFigurePlaceholder(
          opportunity.type,
          opportunity.context
        );

        await figureService.createFigure({
          documentId,
          figureType: opportunity.type,
          caption: opportunity.context,
          order: i + 1,
          placeholderText: placeholder,
        });
      }

      // Stage 5: Finalize (95-100%)
      await this.updateProgress(documentId, 95, '마무리 중...');

      // Save generated content
      await pool.query(
        `UPDATE documents
         SET content = $1, status = 'completed', progress = 100
         WHERE id = $2`,
        [generatedContent, documentId]
      );

      await this.updateProgress(documentId, 100, '완료');
    } catch (error: any) {
      console.error('Document generation error:', error);
      throw error;
    }
  }

  /**
   * Build system prompt based on template type
   * Uses template-specific configuration for government support documents
   */
  private buildSystemPrompt(templateType: string): string {
    // Use template-specific configuration
    return getSystemPrompt(templateType);
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

    return `Based on the following interview responses and relevant context, generate a comprehensive business document.

Interview Responses:
${answersText}

Relevant Context from User's Documents:
${context}

Please generate a professional, well-structured document that:
1. Directly addresses the information provided in the interview
2. Incorporates relevant context from the user's documents when applicable
3. Follows proper business document formatting
4. Uses professional, clear language
5. Is comprehensive yet concise`;
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

  /**
   * Get document by ID
   */
  async getDocument(documentId: string, userId: string): Promise<DocumentRecord> {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0] as DocumentRecord;
  }

  /**
   * Get all documents for user
   */
  async getUserDocuments(userId: string): Promise<DocumentRecord[]> {
    const { rows } = await pool.query(
      `SELECT * FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows as DocumentRecord[];
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );
  }
}

// Export singleton instance
export const documentGenerationService = new DocumentGenerationService();
