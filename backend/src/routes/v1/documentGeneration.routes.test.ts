/**
 * Document Generation Routes Tests
 */

import request from 'supertest';
import express from 'express';
import documentGenerationRoutes from './documentGeneration.routes';
import { documentTemplateService } from '../../services/documentTemplate.service';

// Mock the service
jest.mock('../../services/documentTemplate.service');

// Mock auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-id' };
    next();
  },
  AuthRequest: {},
}));

const app = express();
app.use(express.json());
app.use('/api/v1/document-generation', documentGenerationRoutes);

describe('Document Generation Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/document-generation/templates', () => {
    it('should return all templates', async () => {
      const mockTemplates = [
        {
          id: '1',
          template_type: 'preliminary_startup',
          template_name: '예비창업',
          category: 'gov_support',
          description: '창업아이디어 공모전을 위한 문서',
          prompt_template: 'Generate questions...',
          questions_min: 5,
          questions_max: 7,
          created_at: new Date(),
        },
      ];

      (documentTemplateService.getAllTemplates as jest.Mock).mockResolvedValueOnce(
        mockTemplates
      );

      const response = await request(app).get('/api/v1/document-generation/templates');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockTemplates,
      });
      expect(documentTemplateService.getAllTemplates).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      (documentTemplateService.getAllTemplates as jest.Mock).mockRejectedValueOnce(
        new Error('Service error')
      );

      const response = await request(app).get('/api/v1/document-generation/templates');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to fetch templates',
      });
    });
  });

  describe('GET /api/v1/document-generation/templates/category/:category', () => {
    it('should return templates by category', async () => {
      const mockTemplates = [
        {
          id: '1',
          template_type: 'preliminary_startup',
          template_name: '예비창업',
          category: 'gov_support',
          description: '창업아이디어 공모전을 위한 문서',
          prompt_template: 'Generate questions...',
          questions_min: 5,
          questions_max: 7,
          created_at: new Date(),
        },
      ];

      (documentTemplateService.getTemplatesByCategory as jest.Mock).mockResolvedValueOnce(
        mockTemplates
      );

      const response = await request(app).get(
        '/api/v1/document-generation/templates/category/gov_support'
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockTemplates,
      });
      expect(documentTemplateService.getTemplatesByCategory).toHaveBeenCalledWith(
        'gov_support'
      );
    });
  });

  describe('POST /api/v1/document-generation/start', () => {
    it('should start a new session', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        template_type: 'preliminary_startup',
        status: 'interview',
        answers_json: {},
        current_question_number: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockTemplate = {
        template_type: 'preliminary_startup',
        template_name: '예비창업',
        category: 'gov_support',
      };

      (documentTemplateService.createSession as jest.Mock).mockResolvedValueOnce(
        mockSession
      );
      (documentTemplateService.getTemplateByType as jest.Mock).mockResolvedValueOnce(
        mockTemplate as any
      );

      const response = await request(app)
        .post('/api/v1/document-generation/start')
        .send({ template_type: 'preliminary_startup' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session_id).toBe('session-1');
      expect(documentTemplateService.createSession).toHaveBeenCalledWith(
        'test-user-id',
        'preliminary_startup'
      );
    });

    it('should return 400 if template_type is missing', async () => {
      const response = await request(app).post('/api/v1/document-generation/start').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Template type is required',
      });
    });
  });

  describe('POST /api/v1/document-generation/:sessionId/answer', () => {
    it('should save answer', async () => {
      (documentTemplateService.saveAnswer as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post('/api/v1/document-generation/session-1/answer')
        .send({ question_number: 1, answer: 'Test answer' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: '답변이 저장되었습니다' },
      });
      expect(documentTemplateService.saveAnswer).toHaveBeenCalledWith(
        'session-1',
        'test-user-id',
        1,
        'Test answer'
      );
    });

    it('should return 400 if question_number or answer is missing', async () => {
      const response = await request(app)
        .post('/api/v1/document-generation/session-1/answer')
        .send({ question_number: 1 });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/document-generation/:sessionId/complete-interview', () => {
    it('should complete interview', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        answers_json: { '1': 'Answer 1', '2': 'Answer 2' },
      };

      (documentTemplateService.getSession as jest.Mock).mockResolvedValueOnce(mockSession as any);
      (documentTemplateService.updateSessionStatus as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const response = await request(app).post(
        '/api/v1/document-generation/session-1/complete-interview'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(documentTemplateService.updateSessionStatus).toHaveBeenCalledWith(
        'session-1',
        'test-user-id',
        'completed'
      );
    });
  });

  describe('DELETE /api/v1/document-generation/:sessionId', () => {
    it('should abandon session', async () => {
      (documentTemplateService.updateSessionStatus as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const response = await request(app).delete(
        '/api/v1/document-generation/session-1'
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { message: '문서 생성이 중단되었습니다' },
      });
      expect(documentTemplateService.updateSessionStatus).toHaveBeenCalledWith(
        'session-1',
        'test-user-id',
        'abandoned'
      );
    });
  });

  describe('GET /api/v1/document-generation/:sessionId/progress', () => {
    it('should return session progress', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'test-user-id',
        template_type: 'preliminary_startup',
        status: 'interview',
        current_question_number: 3,
        answers_json: { '1': 'Answer 1', '2': 'Answer 2' },
      };

      const mockTemplate = {
        template_name: '예비창업',
        category: 'gov_support',
        questions_min: 5,
        questions_max: 7,
      };

      (documentTemplateService.getSession as jest.Mock).mockResolvedValueOnce(mockSession as any);
      (documentTemplateService.getSessionAnswers as jest.Mock).mockResolvedValueOnce(
        mockSession.answers_json
      );
      (documentTemplateService.getTemplateByType as jest.Mock).mockResolvedValueOnce(
        mockTemplate as any
      );

      const response = await request(app).get(
        '/api/v1/document-generation/session-1/progress'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session_id).toBe('session-1');
      expect(response.body.data.current_question).toBe(3);
      expect(response.body.data.answer_count).toBe(2);
    });
  });
});
