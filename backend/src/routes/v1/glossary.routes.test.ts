import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import glossaryRoutes from './glossary.routes';
import pool from '../../utils/db';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/glossary', glossaryRoutes);

describe('Glossary Routes', () => {
  let testTermId: string;

  beforeAll(async () => {
    // Insert test data
    const { rows } = await pool.query(
      `INSERT INTO glossary (term, definition, category)
       VALUES ($1, $2, $3) RETURNING id`,
      ['Test Route Term', 'Test definition for routes', 'Test Category']
    );
    testTermId = rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM glossary WHERE id = $1', [testTermId]);
    await pool.end();
  });

  describe('GET /api/v1/glossary/search', () => {
    it('should return empty array for missing query', async () => {
      const response = await request(app)
        .get('/api/v1/glossary/search')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return empty array for non-string query', async () => {
      const response = await request(app)
        .get('/api/v1/glossary/search?q=123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search terms by query', async () => {
      const response = await request(app)
        .get('/api/v1/glossary/search?q=Test Route Term')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]?.term).toContain('Test Route Term');
    });

    it('should handle empty search results gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/glossary/search?q=NonExistentTerm12345')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/v1/glossary/:id', () => {
    it('should return term by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/glossary/${testTermId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTermId);
      expect(response.body.data.term).toBe('Test Route Term');
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/v1/glossary/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/glossary/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/glossary', () => {
    it('should return all terms', async () => {
      const response = await request(app)
        .get('/api/v1/glossary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
