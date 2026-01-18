import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import pool from '../utils/db';
import { GlossaryService } from './glossary.service';
import type { GlossaryTerm } from '../../../shared/types/glossary.types';

describe('GlossaryService', () => {
  let glossaryService: GlossaryService;
  let testTermIds: string[] = [];

  beforeAll(() => {
    glossaryService = new GlossaryService();
  });

  afterAll(async () => {
    // Clean up test data
    for (const id of testTermIds) {
      await pool.query('DELETE FROM glossary WHERE id = $1', [id]);
    }
    await pool.end();
  });

  describe('searchTerms', () => {
    it('should return empty array for short queries', async () => {
      const result = await glossaryService.searchTerms('a');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty query', async () => {
      const result = await glossaryService.searchTerms('');
      expect(result).toEqual([]);
    });

    it('should search terms by term name', async () => {
      // First insert a test term
      const { rows } = await pool.query<GlossaryTerm>(
        'INSERT INTO glossary (term, definition, category) VALUES ($1, $2, $3) RETURNING *',
        ['Test Term', 'Test definition for search', 'Test Category']
      );
      if (rows[0]) {
        testTermIds.push(rows[0].id);
      }

      const results = await glossaryService.searchTerms('Test Term');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.term).toContain('Test Term');
    });

    it('should search terms by definition', async () => {
      const results = await glossaryService.searchTerms('definition for search');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.definition).toContain('definition for search');
    });

    it('should limit results to 5 by default', async () => {
      // Insert multiple test terms
      for (let i = 0; i < 10; i++) {
        const { rows } = await pool.query<GlossaryTerm>(
          'INSERT INTO glossary (term, definition, category) VALUES ($1, $2, $3) RETURNING *',
          [`Limit Test ${i}`, `Definition ${i}`, 'Test']
        );
        if (rows[0]) {
          testTermIds.push(rows[0].id);
        }
      }

      const results = await glossaryService.searchTerms('Limit Test');
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should be case-insensitive', async () => {
      const results = await glossaryService.searchTerms('test term');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent terms', async () => {
      const results = await glossaryService.searchTerms('NonExistentTerm12345');
      expect(results).toEqual([]);
    });
  });

  describe('getTermById', () => {
    it('should return term by ID', async () => {
      const { rows } = await pool.query<GlossaryTerm>(
        'INSERT INTO glossary (term, definition, category) VALUES ($1, $2, $3) RETURNING *',
        ['Get By ID Test', 'Test get by ID', 'Test']
      );
      const testId = rows[0]?.id;
      if (testId) {
        testTermIds.push(testId);
      }

      const term = await glossaryService.getTermById(testId || '');
      expect(term).not.toBeNull();
      expect(term?.id).toBe(testId);
      expect(term?.term).toBe('Get By ID Test');
    });

    it('should return null for non-existent ID', async () => {
      const term = await glossaryService.getTermById('00000000-0000-0000-0000-000000000000');
      expect(term).toBeNull();
    });
  });

  describe('getAllTerms', () => {
    it('should return all terms ordered by category and term', async () => {
      const terms = await glossaryService.getAllTerms();
      expect(Array.isArray(terms)).toBe(true);

      // Check ordering
      for (let i = 1; i < terms.length; i++) {
        const prevTerm = terms[i - 1];
        const currTerm = terms[i];

        if (!prevTerm || !currTerm) continue;

        const prevCategory = prevTerm.category.toLowerCase();
        const currCategory = currTerm.category.toLowerCase();

        if (prevCategory === currCategory) {
          const prevTermName = prevTerm.term.toLowerCase();
          const currTermName = currTerm.term.toLowerCase();
          expect(prevTermName <= currTermName).toBe(true);
        } else {
          expect(prevCategory <= currCategory).toBe(true);
        }
      }
    });

    it('should include seeded terms', async () => {
      const terms = await glossaryService.getAllTerms();
      const seededTerms = terms.filter(t => t.term === 'Lean Startup');
      expect(seededTerms.length).toBeGreaterThan(0);
    });
  });
});
