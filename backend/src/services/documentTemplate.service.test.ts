/**
 * Document Template Service Tests
 */

import { DocumentTemplateService } from './documentTemplate.service';
import pool from '../utils/db';

// Mock database pool
jest.mock('../utils/db');

describe('DocumentTemplateService', () => {
  let service: DocumentTemplateService;
  let mockPool: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock pool
    mockPool = {
      query: jest.fn(),
    };

    // Mock pool to return our mock
    (pool as any) = mockPool;

    service = new DocumentTemplateService();
  });

  describe('getAllTemplates', () => {
    it('should return all document templates', async () => {
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
        {
          id: '2',
          template_type: 'pitch_deck',
          template_name: '피치덱',
          category: 'ir_material',
          description: '투자자 피칭을 위한 프레젠테이션',
          prompt_template: 'Generate questions...',
          questions_min: 7,
          questions_max: 10,
          created_at: new Date(),
        },
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockTemplates });

      const result = await service.getAllTemplates();

      expect(result).toEqual(mockTemplates);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, template_type, template_name')
      );
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.getAllTemplates()).rejects.toThrow('Database error');
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates filtered by category', async () => {
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

      mockPool.query.mockResolvedValueOnce({ rows: mockTemplates });

      const result = await service.getTemplatesByCategory('gov_support');

      expect(result).toEqual(mockTemplates);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = $1'),
        ['gov_support']
      );
    });
  });

  describe('getTemplateByType', () => {
    it('should return template by type', async () => {
      const mockTemplate = {
        id: '1',
        template_type: 'preliminary_startup',
        template_name: '예비창업',
        category: 'gov_support',
        description: '창업아이디어 공모전을 위한 문서',
        prompt_template: 'Generate questions...',
        questions_min: 5,
        questions_max: 7,
        created_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockTemplate] });

      const result = await service.getTemplateByType('preliminary_startup');

      expect(result).toEqual(mockTemplate);
    });

    it('should return null if template not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.getTemplateByType('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createSession', () => {
    it('should create a new document generation session', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'user-1',
        template_type: 'preliminary_startup',
        status: 'interview',
        answers_json: {},
        current_question_number: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockSession] });

      const result = await service.createSession('user-1', 'preliminary_startup');

      expect(result).toEqual(mockSession);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO document_generation_sessions'),
        ['user-1', 'preliminary_startup']
      );
    });
  });

  describe('saveAnswer', () => {
    it('should save answer to session', async () => {
      mockPool.query.mockResolvedValueOnce({});

      await service.saveAnswer('session-1', 'user-1', 1, 'Test answer');

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE document_generation_sessions'),
        expect.any(Array)
      );
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status', async () => {
      mockPool.query.mockResolvedValueOnce({});

      await service.updateSessionStatus('session-1', 'user-1', 'completed');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE document_generation_sessions'),
        expect.arrayContaining(['completed', 'session-1', 'user-1'])
      );
    });
  });

  describe('getSessionAnswers', () => {
    it('should return session answers', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'user-1',
        answers_json: { '1': 'Answer 1', '2': 'Answer 2' },
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockSession] });

      const result = await service.getSessionAnswers('session-1', 'user-1');

      expect(result).toEqual({ '1': 'Answer 1', '2': 'Answer 2' });
    });

    it('should return empty object if session not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.getSessionAnswers('session-1', 'user-1');

      expect(result).toEqual({});
    });
  });
});
