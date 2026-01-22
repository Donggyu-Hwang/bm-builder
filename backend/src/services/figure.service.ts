/**
 * Figure Service
 * Handles chart and infographic generation for documents
 * MVP Phase: Text-based placeholders
 * Future: Image generation with DALL-E/Midjourney
 */

import pool from '../utils/db';

export type FigureType = 'bar' | 'line' | 'pie' | 'flow';

export interface FigureData {
  labels?: string[];
  values?: number[];
  title?: string;
  description?: string;
}

export interface DocumentFigure {
  id: string;
  document_id: string;
  figure_type: FigureType;
  image_url?: string;
  caption?: string;
  data_json: FigureData;
  order: number;
  placeholder_text: string;
  created_at: Date;
}

export class FigureService {
  /**
   * Generate figure placeholder for MVP phase
   */
  generateFigurePlaceholder(
    figureType: FigureType,
    context: string
  ): string {
    const placeholders: Record<FigureType, string> = {
      bar: `
[📊 막대그래프: ${context}]
▂▃▅▇█
이 곳에 시장 규모 비교 막대그래프가 삽입됩니다.
(향후 AI 이미지 생성 기능으로 자동 생성 예정)
`,
      line: `
[📈 선그래프: ${context}]
╱╲╱╲╱
이 곳에 성장 추세 선그래프가 삽입됩니다.
(향후 AI 이미지 생성 기능으로 자동 생성 예정)
`,
      pie: `
[🥧 파이차트: ${context}}
    ╱─╲
   │   │
    ╲─╱
이 곳에 시장 점유율 파이차트가 삽입됩니다.
(향후 AI 이미지 생성 기능으로 자동 생성 예정)
`,
      flow: `
[🔄 플로우차트: ${context}]
→ → → →
↑     ↓
← ← ← ←
이 곳에 비즈니스 프로세스 플로우차트가 삽입됩니다.
(향후 AI 이미지 생성 기능으로 자동 생성 예정)
`,
    };

    return placeholders[figureType] || '[차트가 삽입될 위치]';
  }

  /**
   * Analyze document text to identify figure opportunities
   */
  identifyFigureOpportunities(text: string): Array<{
    type: FigureType;
    context: string;
    position: number;
  }> {
    const opportunities: Array<{
      type: FigureType;
      context: string;
      position: number;
    }> = [];

    // Pattern for bar chart (comparisons, rankings)
    const barPatterns = [
      /(?:시장|규모|비교|순위|매출|점유율).*?(?:\d+%|\d+억|\d+천)/gi,
      /(?:비교|순위).*?상위/gi,
    ];

    // Pattern for line chart (trends, growth)
    const linePatterns = [
      /(?:성장|증가|추세|변화).*?(?:연평|전년|YoY)/gi,
      /(?:매출|사용자|고객).*?증가/gi,
    ];

    // Pattern for pie chart (distribution, share)
    const piePatterns = [
      /(?:점유율|분포|비율).*?%/gi,
      /(?:시장|고객).*?구성/gi,
    ];

    // Pattern for flow chart (process, steps)
    const flowPatterns = [
      /(?:프로세스|단계|절차|진행)/gi,
      /(?:1단계|2단계|3단계|Step|Phase)/gi,
    ];

    // Scan for bar chart opportunities
    barPatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          opportunities.push({
            type: 'bar',
            context: match[0].substring(0, 50),
            position: match.index,
          });
        }
      }
    });

    // Scan for line chart opportunities
    linePatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          opportunities.push({
            type: 'line',
            context: match[0].substring(0, 50),
            position: match.index,
          });
        }
      }
    });

    // Scan for pie chart opportunities
    piePatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          opportunities.push({
            type: 'pie',
            context: match[0].substring(0, 50),
            position: match.index,
          });
        }
      }
    });

    // Scan for flow chart opportunities
    flowPatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          opportunities.push({
            type: 'flow',
            context: match[0].substring(0, 50),
            position: match.index,
          });
        }
      }
    });

    // Return top 5 opportunities sorted by position
    return opportunities
      .sort((a, b) => a.position - b.position)
      .slice(0, 5);
  }

  /**
   * Create figure record in database
   */
  async createFigure(params: {
    documentId: string;
    figureType: FigureType;
    caption?: string;
    dataJson?: FigureData;
    order: number;
    placeholderText: string;
  }): Promise<string> {
    const { rows } = await pool.query(
      `INSERT INTO document_figures (document_id, figure_type, caption, data_json, "order", placeholder_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        params.documentId,
        params.figureType,
        params.caption || null,
        params.dataJson || {},
        params.order,
        params.placeholderText,
      ]
    );

    return rows[0].id;
  }

  /**
   * Get all figures for a document
   */
  async getDocumentFigures(documentId: string): Promise<DocumentFigure[]> {
    const { rows } = await pool.query(
      `SELECT * FROM document_figures
       WHERE document_id = $1
       ORDER BY "order" ASC`,
      [documentId]
    );

    return rows as DocumentFigure[];
  }

  /**
   * Regenerate figure (placeholder for future AI image generation)
   */
  async regenerateFigure(figureId: string): Promise<DocumentFigure> {
    const { rows } = await pool.query(
      'SELECT * FROM document_figures WHERE id = $1',
      [figureId]
    );

    if (rows.length === 0) {
      throw new Error('Figure not found');
    }

    const figure = rows[0] as DocumentFigure;

    // For MVP: just update the placeholder text
    const newPlaceholder = this.generateFigurePlaceholder(
      figure.figure_type,
      `재생성됨: ${figure.caption || '차트'}`
    );

    const { rows: updatedRows } = await pool.query(
      `UPDATE document_figures
       SET placeholder_text = $1
       WHERE id = $2
       RETURNING *`,
      [newPlaceholder, figureId]
    );

    return updatedRows[0] as DocumentFigure;
  }

  /**
   * Delete figure
   */
  async deleteFigure(figureId: string): Promise<void> {
    await pool.query('DELETE FROM document_figures WHERE id = $1', [figureId]);
  }
}

// Export singleton instance
export const figureService = new FigureService();
