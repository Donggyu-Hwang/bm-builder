/**
 * Document Retry Routes
 * API endpoints for retrying failed document generation
 */

import { Router, Response, Request } from 'express';
import pool from '../../utils/db';
import { documentGenerationService } from '../../services/documentGeneration.service';
import { requireAuth } from '../../middleware/auth.middleware';
import { claudeWithFallbackService } from '../../services/claudeWithFallback.service';

const router = Router();

/**
 * POST /api/v1/retry/document/:documentId
 * Retry failed document generation
 */
router.post('/document/:documentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DOCUMENT_ID', message: 'Document ID is required' },
      });
    }

    // Check if document exists and belongs to user
    const { rows: docRows } = await pool.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (docRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    const document = docRows[0];

    // Check if retry attempts exceeded
    if (document.retry_attempts >= 3) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MAX_RETRIES_EXCEEDED',
          message: '최대 재시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
        },
      });
    }

    // Update retry attempts and status
    await pool.query(
      `UPDATE documents
       SET retry_attempts = retry_attempts + 1,
           status = 'generating',
           progress = 0,
           progress_message = '재시도 중...',
           updated_at = NOW()
       WHERE id = $1`,
      [documentId]
    );

    // Get original answers from session (if available)
    const { rows: sessionRows } = await pool.query(
      `SELECT answers_json FROM document_generation_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (sessionRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_SESSION_FOUND',
          message: '원래 인터뷰 세션을 찾을 수 없습니다. 다시 시작해주세요.',
        },
      });
    }

    const answers = sessionRows[0].answers_json;

    // Restart generation (background)
    documentGenerationService
      .generateDocument({
        userId,
        templateType: document.template_type,
        answers,
      })
      .catch((error) => {
        console.error('Document retry failed:', error);
      });

    res.json({
      success: true,
      data: {
        document_id: documentId,
        message: '문서 생성을 재시도합니다',
        retry_attempt: document.retry_attempts + 1,
      },
    });
  } catch (error) {
    console.error('Failed to retry document generation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RETRY_FAILED',
        message: '재시도에 실패했습니다',
      },
    });
  }
});

/**
 * POST /api/v1/retry/document/:documentId/save-as-draft
 * Save failed document as draft
 */
router.post(
  '/document/:documentId/save-as-draft',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
      }
      const userId = user.id;

      const documentId = req.params.documentId;
      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DOCUMENT_ID', message: 'Document ID is required' },
        });
      }

      // Check if document exists and belongs to user
      const { rows: docRows } = await pool.query(
        `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
        [documentId, userId]
      );

      if (docRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: '문서를 찾을 수 없습니다',
          },
        });
      }

      // Update status to draft
      await pool.query(
        `UPDATE documents
       SET status = 'draft',
           progress_message = '임시 저장됨',
           updated_at = NOW()
       WHERE id = $1`,
        [documentId]
      );

      res.json({
        success: true,
        data: {
          message: '임시 저장되었습니다. 대시보드에서 다시 시작할 수 있습니다.',
        },
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: '임시 저장에 실패했습니다',
        },
      });
    }
  }
);

/**
 * GET /api/v1/retry/status
 * Get circuit breaker status (for monitoring)
 */
router.get('/status', requireAuth, async (_req: Request, res: Response) => {
  try {
    const circuitBreakerState = claudeWithFallbackService.getCircuitBreakerState();

    res.json({
      success: true,
      data: {
        circuit_breaker: circuitBreakerState,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to get retry status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_FAILED',
        message: '상태 조회에 실패했습니다',
      },
    });
  }
});

/**
 * POST /api/v1/retry/reset-circuit-breaker
 * Reset circuit breaker (admin only - for now open to all users)
 */
router.post('/reset-circuit-breaker', requireAuth, async (_req: Request, res: Response) => {
  try {
    claudeWithFallbackService.resetCircuitBreaker();

    res.json({
      success: true,
      data: {
        message: 'Circuit breaker가 리셋되었습니다',
      },
    });
  } catch (error) {
    console.error('Failed to reset circuit breaker:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_FAILED',
        message: 'Circuit breaker 리셋에 실패했습니다',
      },
    });
  }
});

export default router;
