/**
 * Document Generation Routes
 * API endpoints for AI-powered document generation
 */

import { Router, Response, Request } from 'express';
import pool from '../../utils/db';
import { documentGenerationService } from '../../services/documentGeneration.service';
import { claudeWithFallbackService } from '../../services/claudeWithFallback.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { templateConfigs } from '../../config/templatePrompts';

const router = Router();

/**
 * GET /api/v1/document-generation/templates
 * Get all available document templates
 */
router.get('/templates', requireAuth, async (_req: Request, res: Response) => {
  try {
    // Convert templateConfigs to array format expected by frontend
    const templates = Object.values(templateConfigs).map((config) => ({
      id: config.templateType,
      template_type: config.templateType,
      template_name: config.templateName,
      category: config.templateType.startsWith('pitch') ? 'ir_material' : 'gov_support',
      description: `${config.templateName} 문서 템플릿`,
      target_length: config.targetLength,
      min_questions: config.minQuestions,
      max_questions: config.maxQuestions,
      requirements: config.requirements,
      sections: config.sections,
    }));

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TEMPLATES_FAILED',
        message: 'Failed to fetch templates',
      },
    });
  }
});

/**
 * POST /api/v1/document-generation/questions
 * Generate interview questions for a template type
 */
router.post('/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { template_type } = req.body;

    if (!template_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TEMPLATE_TYPE',
          message: 'Template type is required',
        },
      });
    }

    const questions = await claudeWithFallbackService.generateQuestionsWithRetry(template_type);

    res.json({
      success: true,
      data: {
        questions: questions.map((q, i) => ({
          id: `q${i + 1}`,
          question: q,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to generate questions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUESTIONS_FAILED',
        message: 'Failed to generate questions',
      },
    });
  }
});

/**
 * POST /api/v1/document-generation/start
 * Start a new document generation session
 */
router.post('/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { template_type } = req.body;

    if (!template_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TEMPLATE_TYPE',
          message: 'Template type is required',
        },
      });
    }

    // Create a new session
    const { rows: sessionRows } = await pool.query(
      `INSERT INTO document_generation_sessions (user_id, template_type, status, answers_json, current_question_number)
       VALUES ($1, $2, 'interview', '{}', 1)
       RETURNING id, template_type, status, current_question_number`,
      [userId, template_type]
    );

    const session = sessionRows[0];

    // Get template name for display
    const templateConfig = templateConfigs[template_type];
    const templateName = templateConfig?.templateName || template_type;

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        templateType: session.template_type,
        templateName: templateName,
        status: session.status,
        currentQuestion: session.current_question_number,
      },
    });
  } catch (error) {
    console.error('Failed to start session:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_START_FAILED',
        message: 'Failed to start session',
      },
    });
  }
});

/**
 * GET /api/v1/document-generation/:id
 * Get document by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const document = await documentGenerationService.getDocument(documentId, userId);

    res.json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
        },
      });
    }

    console.error('Failed to fetch document:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch document',
      },
    });
  }
});

/**
 * GET /api/v1/document-generation
 * Get all documents for current user
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documents = await documentGenerationService.getUserDocuments(userId);

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch documents',
      },
    });
  }
});

/**
 * DELETE /api/v1/document-generation/:id
 * Delete a document
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    await documentGenerationService.deleteDocument(documentId, userId);

    res.json({
      success: true,
      data: {
        message: 'Document deleted successfully',
      },
    });
  } catch (error) {
    console.error('Failed to delete document:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete document',
      },
    });
  }
});

export default router;
