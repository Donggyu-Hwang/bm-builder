import { Router, Response, Request } from 'express';
import { embeddedDocumentsService } from '../../services/embeddedDocuments.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { getAuthenticatedUser } from '../../utils/requestHelpers';

const router = Router();

/**
 * GET /api/v1/documents
 * Get all documents for authenticated user with optional filtering
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const filter = (req.query.filter as 'all' | 'business' | 'excluded') || 'all';
    const search = req.query.search as string | undefined;

    let documents;
    if (search) {
      documents = await embeddedDocumentsService.searchDocuments(userId, search, filter);
    } else {
      documents = await embeddedDocumentsService.getUserDocuments(userId, filter);
    }

    res.json({
      success: true,
      data: documents,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '문서 목록을 가져오는데 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/documents/stats
 * Get document statistics
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const stats = await embeddedDocumentsService.getDocumentStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '통계를 가져오는데 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/documents/:id
 * Get document by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
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
    const document = await embeddedDocumentsService.getDocumentById(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서를 가져오는데 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/documents/:id/preview
 * Get document preview
 */
router.get('/:id/preview', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
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
    const preview = await embeddedDocumentsService.getDocumentPreview(documentId, userId);

    res.json({
      success: true,
      data: preview,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '미리보기를 가져오는데 실패했습니다';
    const statusCode = errorMessage === 'Document not found' ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'NOT_FOUND' : 'PREVIEW_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * PATCH /api/v1/documents/:id
 * Update document classification
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
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
    const updates = req.body;

    // MEDIUM FIX: Consolidated validation logic using helper function
    const validationErrors: string[] = [];

    // Validate is_business_document
    if ('is_business_document' in updates) {
      if (typeof updates.is_business_document !== 'boolean') {
        validationErrors.push('is_business_document must be a boolean');
      }
    }

    // Validate is_excluded
    if ('is_excluded' in updates) {
      if (typeof updates.is_excluded !== 'boolean') {
        validationErrors.push('is_excluded must be a boolean');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: validationErrors.join('; '),
        },
      });
    }

    const document = await embeddedDocumentsService.updateDocument(documentId, userId, updates);

    res.json({
      success: true,
      data: document,
      message: '저장되었습니다!',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서 업데이트에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/documents/batch-update
 * Batch update multiple documents
 */
router.post('/batch-update', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { documentIds, updates } = req.body;

    // Validate input
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'documentIds must be a non-empty array',
        },
      });
    }

    if (typeof updates !== 'object' || updates === null) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'updates must be an object',
        },
      });
    }

    const result = await embeddedDocumentsService.batchUpdateDocuments(
      documentIds,
      userId,
      updates
    );

    res.json({
      success: true,
      data: result,
      message: `${result.updated}개 문서가 업데이트되었습니다${result.failed > 0 ? ` (${result.failed}개 실패)` : ''}`,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '일괄 업데이트에 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
});

export default router;
