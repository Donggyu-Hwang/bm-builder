import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Application } from 'express';
import embeddedDocumentsRoutes from './embeddedDocuments.routes';
import { embeddedDocumentsService } from '../../services/embeddedDocuments.service';

// Mock the service
jest.mock('../../services/embeddedDocuments.service', () => ({
  embeddedDocumentsService: {
    getUserDocuments: jest.fn(),
    getDocumentById: jest.fn(),
    updateDocument: jest.fn(),
    batchUpdateDocuments: jest.fn(),
    getDocumentPreview: jest.fn(),
    getDocumentStats: jest.fn(),
    searchDocuments: jest.fn(),
  },
}));

// Mock the auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  },
}));

describe('Embedded Documents Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/documents', embeddedDocumentsRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/v1/documents', () => {
    it('should fetch all documents without filter', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          file_name: 'test.pdf',
          file_type: 'pdf',
          size: 1024,
          is_business_document: true,
          is_excluded: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.mocked(embeddedDocumentsService.getUserDocuments).mockResolvedValueOnce(
        mockDocuments as never
      );

      const response = await request(app).get('/api/v1/documents');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockDocuments,
      });
      expect(embeddedDocumentsService.getUserDocuments).toHaveBeenCalledWith(
        'test-user-id',
        'all'
      );
    });

    it('should fetch documents with filter', async () => {
      jest.mocked(embeddedDocumentsService.getUserDocuments).mockResolvedValueOnce(
        [] as never
      );

      await request(app).get('/api/v1/documents?filter=business');

      expect(embeddedDocumentsService.getUserDocuments).toHaveBeenCalledWith(
        'test-user-id',
        'business'
      );
    });

    it('should search documents when search query provided', async () => {
      jest.mocked(embeddedDocumentsService.searchDocuments).mockResolvedValueOnce(
        [] as never
      );

      await request(app).get('/api/v1/documents?search=test');

      expect(embeddedDocumentsService.searchDocuments).toHaveBeenCalledWith(
        'test-user-id',
        'test',
        'all'
      );
    });

    it('should handle errors', async () => {
      jest.mocked(embeddedDocumentsService.getUserDocuments).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app).get('/api/v1/documents');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/documents/stats', () => {
    it('should fetch document statistics', async () => {
      const mockStats = {
        total: 10,
        business: 7,
        excluded: 2,
      };

      jest.mocked(embeddedDocumentsService.getDocumentStats).mockResolvedValueOnce(
        mockStats as never
      );

      const response = await request(app).get('/api/v1/documents/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockStats,
      });
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('should fetch document by ID', async () => {
      const mockDocument = {
        id: 'doc-1',
        file_name: 'test.pdf',
        file_type: 'pdf',
        size: 1024,
        is_business_document: true,
        is_excluded: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.mocked(embeddedDocumentsService.getDocumentById).mockResolvedValueOnce(
        mockDocument as never
      );

      const response = await request(app).get('/api/v1/documents/doc-1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockDocument);
    });

    it('should return 404 when document not found', async () => {
      jest.mocked(embeddedDocumentsService.getDocumentById).mockResolvedValueOnce(
        null as never
      );

      const response = await request(app).get('/api/v1/documents/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/documents/:id/preview', () => {
    it('should fetch document preview', async () => {
      const mockPreview = { preview: 'Test preview content' };

      jest.mocked(embeddedDocumentsService.getDocumentPreview).mockResolvedValueOnce(
        mockPreview as never
      );

      const response = await request(app).get('/api/v1/documents/doc-1/preview');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockPreview);
    });

    it('should return 404 when document not found', async () => {
      jest.mocked(embeddedDocumentsService.getDocumentPreview).mockRejectedValueOnce(
        new Error('Document not found')
      );

      const response = await request(app).get('/api/v1/documents/nonexistent/preview');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/documents/:id', () => {
    it('should update document classification', async () => {
      const updatedDocument = {
        id: 'doc-1',
        file_name: 'test.pdf',
        file_type: 'pdf',
        size: 1024,
        is_business_document: false,
        is_excluded: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.mocked(embeddedDocumentsService.updateDocument).mockResolvedValueOnce(
        updatedDocument as never
      );

      const response = await request(app)
        .patch('/api/v1/documents/doc-1')
        .send({ is_business_document: false });

      expect(response.status).toBe(200);
      expect(response.body.data.is_business_document).toBe(false);
      expect(response.body.message).toBe('저장되었습니다!');
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .patch('/api/v1/documents/doc-1')
        .send({ is_business_document: 'not-a-boolean' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when document not found', async () => {
      jest.mocked(embeddedDocumentsService.updateDocument).mockRejectedValueOnce(
        new Error('Document not found')
      );

      const response = await request(app)
        .patch('/api/v1/documents/nonexistent')
        .send({ is_business_document: true });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/documents/batch-update', () => {
    it('should batch update documents', async () => {
      const mockResult = { updated: 2, failed: 0 };

      jest.mocked(embeddedDocumentsService.batchUpdateDocuments).mockResolvedValueOnce(
        mockResult as never
      );

      const response = await request(app)
        .post('/api/v1/documents/batch-update')
        .send({
          documentIds: ['doc-1', 'doc-2'],
          updates: { is_business_document: true },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockResult);
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/documents/batch-update')
        .send({ documentIds: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
