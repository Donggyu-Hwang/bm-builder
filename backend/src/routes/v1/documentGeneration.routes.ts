/**
 * Document Generation Routes
 * API endpoints for AI-powered document generation
 */

import { Router, Response } from 'express';
import { documentGenerationService } from '../../services/documentGeneration.service';
import { claudeWithFallbackService } from '../../services/claudeWithFallback.service';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/v1/document-generation/questions
 * Generate interview questions for a template type
 */
router.post('/questions', requireAuth, async (req: AuthRequest, res: Response) => {
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
 * Start document generation process
 */
router.post('/start', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const { template_type, answers } = req.body;

    if (!template_type || !answers) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Template type and answers are required',
        },
      });
    }

    const documentId = await documentGenerationService.generateDocument({
      userId,
      templateType: template_type,
      answers,
    });

    res.json({
      success: true,
      data: { document_id: documentId },
    });
  } catch (error) {
    console.error('Failed to start document generation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: 'Failed to start document generation',
      },
    });
  }
});

/**
 * GET /api/v1/document-generation/:id
 * Get document by ID
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const documentId = req.params.id;
    const document = await documentGenerationService.getDocument(
      documentId,
      userId
    );

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
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

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
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const documentId = req.params.id;
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
