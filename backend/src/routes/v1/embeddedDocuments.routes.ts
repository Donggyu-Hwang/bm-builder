import { Router } from 'express';
import { embeddedDocumentsService } from '../../services/embeddedDocuments.service';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/documents
 * Get all documents for authenticated user with optional filtering
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const filter = req.query.filter as 'all' | 'business' | 'excluded' || 'all';
    const search = req.query.search as string | undefined;

    let documents;
    if (search) {
      documents = await embeddedDocumentsService.searchDocuments(userId, search, filter);
    } else {
      documents = await embeddedDocumentsService.getUserDocuments(userId, filter);
    }

    res.json({
      success: true,
      data: documents
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서 목록을 가져오는데 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * GET /api/v1/documents/stats
 * Get document statistics
 */
router.get('/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const stats = await embeddedDocumentsService.getDocumentStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '통계를 가져오는데 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * GET /api/v1/documents/:id
 * Get document by ID
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const documentId = req.params.id;
    const document = await embeddedDocumentsService.getDocumentById(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다'
        }
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서를 가져오는데 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * GET /api/v1/documents/:id/preview
 * Get document preview
 */
router.get('/:id/preview', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const documentId = req.params.id;
    const preview = await embeddedDocumentsService.getDocumentPreview(documentId, userId);

    res.json({
      success: true,
      data: preview
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '미리보기를 가져오는데 실패했습니다';
    const statusCode = errorMessage === 'Document not found' ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'NOT_FOUND' : 'PREVIEW_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * PATCH /api/v1/documents/:id
 * Update document classification
 */
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const documentId = req.params.id;
    const updates = req.body;

    // Validate updates
    if (
      typeof updates.is_business_document !== 'undefined' &&
      typeof updates.is_business_document !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'is_business_document must be a boolean'
        }
      });
    }

    if (
      typeof updates.is_excluded !== 'undefined' &&
      typeof updates.is_excluded !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'is_excluded must be a boolean'
        }
      });
    }

    const document = await embeddedDocumentsService.updateDocument(
      documentId,
      userId,
      updates
    );

    res.json({
      success: true,
      data: document,
      message: '저장되었습니다!'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서 업데이트에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * POST /api/v1/documents/batch-update
 * Batch update multiple documents
 */
router.post('/batch-update', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required'
        }
      });
    }

    const { documentIds, updates } = req.body;

    // Validate input
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'documentIds must be a non-empty array'
        }
      });
    }

    if (typeof updates !== 'object' || updates === null) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'updates must be an object'
        }
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
      message: `${result.updated}개 문서가 업데이트되었습니다${result.failed > 0 ? ` (${result.failed}개 실패)` : ''}`
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '일괄 업데이트에 실패했습니다';
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_UPDATE_FAILED',
        message: errorMessage
      }
    });
  }
});

export default router;
