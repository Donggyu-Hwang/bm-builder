import pool from '../utils/db';
import type { GlossaryTerm } from '../../../shared/types/glossary.types';

export class GlossaryService {
  /**
   * Search glossary terms by query
   * Searches both term name and definition (case-insensitive)
   * @param query - Search query (minimum 2 characters)
   * @param limit - Maximum number of results (default: 5)
   * @returns Array of matching glossary terms
   */
  async searchTerms(query: string, limit: number = 5): Promise<GlossaryTerm[]> {
    // Validate input
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      // Use parameterized query with ILIKE for case-insensitive search
      const queryParams = [`${query.trim()}%`, `%${query.trim()}%`, limit];

      const { rows } = await pool.query<GlossaryTerm>(
        `SELECT * FROM glossary
         WHERE term ILIKE $1 OR definition ILIKE $2
         ORDER BY term ASC
         LIMIT $3`,
        queryParams
      );

      return rows;
    } catch (error) {
      console.error('Error searching glossary:', error);
      return [];
    }
  }

  /**
   * Get term by ID
   * @param id - Glossary term UUID
   * @returns Glossary term or null if not found
   */
  async getTermById(id: string): Promise<GlossaryTerm | null> {
    if (!id) {
      return null;
    }

    try {
      const { rows } = await pool.query<GlossaryTerm>(
        'SELECT * FROM glossary WHERE id = $1',
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching term by ID:', error);
      return null;
    }
  }

  /**
   * Get all terms (for admin use)
   * @returns All glossary terms ordered by category and term
   */
  async getAllTerms(): Promise<GlossaryTerm[]> {
    try {
      const { rows } = await pool.query<GlossaryTerm>(
        `SELECT * FROM glossary
         ORDER BY category ASC, term ASC`
      );

      return rows;
    } catch (error) {
      console.error('Error fetching all terms:', error);
      return [];
    }
  }
}

// Export singleton instance
export const glossaryService = new GlossaryService();
