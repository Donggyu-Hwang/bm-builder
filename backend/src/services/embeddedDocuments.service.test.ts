import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import pool from '../utils/db';
import { embeddedDocumentsService } from './embeddedDocuments.service';
import type { EmbeddedDocument } from '../../../../shared/types/embeddedDocuments.types';

describe('EmbeddedDocumentsService', () => {
  const mockUserId = 'test-user-doc-preview';
  let testDocumentIds: string[] = [];

  beforeAll(async () => {
    // Clean up any existing test data
    await pool.query('DELETE FROM embedded_documents WHERE user_id = $1', [mockUserId]);
  });

  afterAll(async () => {
    // Clean up test data
    for (const id of testDocumentIds) {
      await pool.query('DELETE FROM embedded_documents WHERE id = $1', [id]);
    }
    await pool.end();
  });

  describe('getUserDocuments', () => {
    it('should return empty array when no documents exist', async () => {
      const result = await embeddedDocumentsService.getUserDocuments(mockUserId, 'all');
      expect(result).toEqual([]);
    });

    it('should create and retrieve documents', async () => {
      // Create a test document
      const { rows } = await pool.query<EmbeddedDocument>(
        `INSERT INTO embedded_documents
         (user_id, file_id, file_name, file_type, size, is_business_document, is_excluded)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [mockUserId, 'test-file-1', 'test.pdf', 'pdf', 1024, true, false]
      );

      if (rows[0]) {
        testDocumentIds.push(rows[0].id);
      }

      // Retrieve all documents
      const result = await embeddedDocumentsService.getUserDocuments(mockUserId, 'all');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.file_name).toBe('test.pdf');
    });

    it('should filter by business documents', async () => {
      const result = await embeddedDocumentsService.getUserDocuments(mockUserId, 'business');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(doc => doc.is_business_document && !doc.is_excluded)).toBe(true);
    });

    it('should filter by excluded documents', async () => {
      // Create an excluded document
      const { rows } = await pool.query<EmbeddedDocument>(
        `INSERT INTO embedded_documents
         (user_id, file_id, file_name, file_type, size, is_business_document, is_excluded)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [mockUserId, 'test-file-2', 'excluded.pdf', 'pdf', 2048, true, true]
      );

      if (rows[0]) {
        testDocumentIds.push(rows[0].id);
      }

      const result = await embeddedDocumentsService.getUserDocuments(mockUserId, 'excluded');
      expect(result.some(doc => doc.is_excluded)).toBe(true);
    });
  });

  describe('getDocumentById', () => {
    it('should retrieve document by ID', async () => {
      const result = await embeddedDocumentsService.getDocumentById(testDocumentIds[0], mockUserId);
      expect(result).not.toBeNull();
      expect(result?.file_name).toBe('test.pdf');
    });

    it('should return null for non-existent document', async () => {
      const result = await embeddedDocumentsService.getDocumentById('non-existent-id', mockUserId);
      expect(result).toBeNull();
    });
  });

  describe('updateDocument', () => {
    it('should update document classification', async () => {
      const updatedDoc = await embeddedDocumentsService.updateDocument(
        testDocumentIds[0],
        mockUserId,
        { is_business_document: false }
      );

      expect(updatedDoc.is_business_document).toBe(false);
    });

    it('should throw error for non-existent document', async () => {
      await expect(
        embeddedDocumentsService.updateDocument('non-existent-id', mockUserId, { is_excluded: true })
      ).rejects.toThrow('Document not found');
    });

    it('should update is_excluded flag', async () => {
      const updatedDoc = await embeddedDocumentsService.updateDocument(
        testDocumentIds[0],
        mockUserId,
        { is_excluded: true }
      );

      expect(updatedDoc.is_excluded).toBe(true);
    });
  });

  describe('getDocumentPreview', () => {
    it('should return document preview', async () => {
      const result = await embeddedDocumentsService.getDocumentPreview(testDocumentIds[0], mockUserId);
      expect(result.preview).toContain('test.pdf');
      expect(result.preview).toContain('PDF');
    });

    it('should throw error for non-existent document', async () => {
      await expect(
        embeddedDocumentsService.getDocumentPreview('non-existent-id', mockUserId)
      ).rejects.toThrow('Document not found');
    });
  });

  describe('getDocumentStats', () => {
    it('should return document statistics', async () => {
      const stats = await embeddedDocumentsService.getDocumentStats(mockUserId);

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.business).toBeGreaterThanOrEqual(0);
      expect(stats.excluded).toBeGreaterThanOrEqual(0);
      expect(stats.total).toBeGreaterThanOrEqual(stats.business + stats.excluded);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by filename', async () => {
      const results = await embeddedDocumentsService.searchDocuments(mockUserId, 'test');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.file_name).toContain('test');
    });

    it('should return empty array for non-matching search', async () => {
      const results = await embeddedDocumentsService.searchDocuments(mockUserId, 'nonexistent');
      expect(results).toEqual([]);
    });

    it('should combine search with filter', async () => {
      const results = await embeddedDocumentsService.searchDocuments(mockUserId, 'test', 'excluded');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('batchUpdateDocuments', () => {
    it('should update multiple documents', async () => {
      // Create another test document
      const { rows } = await pool.query<EmbeddedDocument>(
        `INSERT INTO embedded_documents
         (user_id, file_id, file_name, file_type, size, is_business_document, is_excluded)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [mockUserId, 'test-file-3', 'batch-test.pdf', 'pdf', 4096, false, false]
      );

      if (rows[0]) {
        testDocumentIds.push(rows[0].id);
      }

      const result = await embeddedDocumentsService.batchUpdateDocuments(
        [testDocumentIds[0], testDocumentIds[testDocumentIds.length - 1]],
        mockUserId,
        { is_business_document: true }
      );

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures gracefully', async () => {
      const result = await embeddedDocumentsService.batchUpdateDocuments(
        ['non-existent-id', testDocumentIds[0]],
        mockUserId,
        { is_excluded: false }
      );

      // Should succeed for valid ID and fail for invalid one
      expect(result.updated + result.failed).toBe(2);
    });
  });
});
