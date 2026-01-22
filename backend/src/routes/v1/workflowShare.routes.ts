/**
 * Workflow Share Routes
 * API endpoints for generating and accessing shareable workflow links
 */

import { Router } from 'express';
import { pool } from '../../config/db';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/v1/workflow/share
 * Generate a shareable link for a workflow
 *
 * Request body:
 * - documentId: UUID of the document to share
 * - accessControl: 'anyone' | 'password'
 * - password: string (optional, required if accessControl is 'password')
 * - expiration: 'never' | '7days' | '30days'
 *
 * Response:
 * - success: boolean
 * - data.url: string (shareable URL)
 */
router.post('/workflow/share', authenticate, async (req, res) => {
  try {
    const { documentId, accessControl, password, expiration } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DOCUMENT_ID',
          message: '문서 ID가 필요합니다.',
        },
      });
    }

    if (!['anyone', 'password'].includes(accessControl)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACCESS_CONTROL',
          message: '액세스 제어가 유효하지 않습니다.',
        },
      });
    }

    if (accessControl === 'password' && !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PASSWORD',
          message: '비밀번호가 필요합니다.',
        },
      });
    }

    if (!['never', '7days', '30days'].includes(expiration)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EXPIRATION',
          message: '만료 기간이 유효하지 않습니다.',
        },
      });
    }

    // Verify user owns the document
    const documentCheck = await pool.query(
      'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (documentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: '문서를 찾을 수 없거나 권한이 없습니다.',
        },
      });
    }

    // Generate unique share ID
    const shareId = crypto.randomUUID();

    // Calculate expiration date
    let expiresAt = null;
    if (expiration === '7days') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else if (expiration === '30days') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    // Hash password if provided
    let hashedPassword = null;
    if (accessControl === 'password' && password) {
      // For now, store as-is (in production, use bcrypt)
      hashedPassword = password;
    }

    // Save to database
    await pool.query(
      `INSERT INTO shared_workflows (share_id, document_id, access_control, password, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [shareId, documentId, accessControl, hashedPassword, expiresAt, userId]
    );

    // Generate share URL
    const shareUrl = `${process.env.APP_URL || 'http://localhost:5173'}/workflow/share/${shareId}`;

    res.json({
      success: true,
      data: { url: shareUrl },
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '공유 링크 생성에 실패했습니다.',
      },
    });
  }
});

/**
 * GET /api/v1/workflow/share/:shareId
 * Access a shared workflow
 *
 * Response:
 * - success: boolean
 * - data: object (workflow data)
 */
router.get('/workflow/share/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    // Get shared workflow
    const result = await pool.query(
      `SELECT sw.*, d.title, d.content, d.template_type, d.status, d.created_at, d.updated_at
       FROM shared_workflows sw
       JOIN documents d ON sw.document_id = d.id
       WHERE sw.share_id = $1`,
      [shareId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '공유 링크를 찾을 수 없습니다.',
        },
      });
    }

    const workflow = result.rows[0];

    // Check expiration
    if (workflow.expires_at && new Date() > workflow.expires_at) {
      return res.status(410).json({
        success: false,
        error: {
          code: 'EXPIRED',
          message: '공유 링크가 만료되었습니다.',
        },
      });
    }

    // Check password protection
    if (workflow.access_control === 'password') {
      const { password } = req.query;

      if (!password || password !== workflow.password) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message: '비밀번호가 필요합니다.',
          },
        });
      }
    }

    // Update last accessed time
    await pool.query(
      'UPDATE shared_workflows SET last_accessed_at = NOW() WHERE share_id = $1',
      [shareId]
    );

    // Return workflow data (without password)
    const { password: _, ...workflowData } = workflow;

    res.json({
      success: true,
      data: workflowData,
    });
  } catch (error) {
    console.error('Error accessing shared workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '공유 워크플로우 로드에 실패했습니다.',
      },
    });
  }
});

/**
 * DELETE /api/v1/workflow/share/:shareId
 * Delete a shared workflow link
 */
router.delete('/workflow/share/:shareId', authenticate, async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id;

    // Verify user owns the shared workflow
    const result = await pool.query(
      'DELETE FROM shared_workflows WHERE share_id = $1 AND created_by = $2 RETURNING id',
      [shareId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '공유 링크를 찾을 수 없거나 권한이 없습니다.',
        },
      });
    }

    res.json({
      success: true,
      message: '공유 링크가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting share link:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '공유 링크 삭제에 실패했습니다.',
      },
    });
  }
});

export default router;
