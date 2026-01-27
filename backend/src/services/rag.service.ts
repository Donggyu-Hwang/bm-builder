/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles document search and context building for AI generation
 */

import pool from '../utils/db';

export interface DocumentContext {
  file_id: string;
  file_name: string;
  content: string;
  similarity: number;
}

export class RAGService {
  /**
   * Extract keywords from user answers using simple NLP
   */
  extractKeywords(answers: Record<string, string>): string[] {
    const allText = Object.values(answers).join(' ');

    // Simple keyword extraction (can be enhanced with proper NLP)
    const keywords = allText
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .filter(
        (word) => !['있다', '이다', '하다', '되다', '같다', '없다', '위해', '통해'].includes(word)
      );

    // Remove duplicates and return top 10
    return [...new Set(keywords)].slice(0, 10);
  }

  /**
   * Search for similar documents using pgvector
   * Note: This is a simplified version - in production use proper embeddings
   */
  async searchSimilarDocuments(
    userId: string,
    keywords: string[],
    limit: number = 5
  ): Promise<DocumentContext[]> {
    try {
      // Simple text-based search using LIKE (production should use pgvector)
      const keywordConditions = keywords
        .slice(0, 5)
        .map((_, i) => `content LIKE $${i + 2}`)
        .join(' OR ');

      const query = `
        SELECT
          file_id,
          file_name,
          content,
          1.0 as similarity
        FROM embedded_documents
        WHERE user_id = $1
          AND is_business_document = true
          AND is_deleted = false
          AND is_excluded = false
          AND (${keywordConditions})
        ORDER BY created_at DESC
        LIMIT $${keywords.length + 2}
      `;

      const params = [userId, ...keywords.slice(0, 5).map((k) => `%${k}%`), limit];

      const { rows } = await pool.query(query, params);

      return rows.map((row) => ({
        file_id: row.file_id,
        file_name: row.file_name,
        content: row.content,
        similarity: row.similarity,
      }));
    } catch (error) {
      console.error('Error searching similar documents:', error);
      return [];
    }
  }

  /**
   * Build context from similar documents
   */
  buildContext(documents: DocumentContext[]): string {
    if (documents.length === 0) {
      return '관련 문서를 찾을 수 없습니다.';
    }

    return documents
      .map(
        (doc, i) => `
[관련 문서 ${i + 1}: ${doc.file_name}]
${doc.content.substring(0, 1000)}...
`
      )
      .join('\n');
  }
}

// Export singleton instance
export const ragService = new RAGService();
