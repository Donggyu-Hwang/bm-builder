import { Router, Response } from 'express';
import { googleOAuthService } from '../../services/googleOAuth.service';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware';
import pool from '../../utils/db';
import * as crypto from 'crypto';

const router = Router();

/**
 * GET /api/v1/google-drive/auth-url
 * Get OAuth authorization URL for Google Drive
 */
router.get('/auth-url', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    // Use cryptographically secure random generation for OAuth state
    const state = crypto.randomBytes(32).toString('hex');
    const authUrl = googleOAuthService.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl, state }
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_ERROR',
        message: 'OAuth URL 생성에 실패했습니다'
      }
    });
  }
});

/**
 * POST /api/v1/google-drive/callback
 * Handle OAuth callback and save tokens
 */
router.post('/callback', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'OAuth 코드가 없습니다'
        }
      });
    }

    // Exchange code for tokens
    const tokens = await googleOAuthService.exchangeCodeForTokens(code);

    // Save to database
    await googleOAuthService.saveTokens(userId, tokens);

    // Note: Background file scan will be triggered in Story 2.2
    // googleDriveScannerService.scanFiles(userId).catch((error) => {
    //   console.error('Background scan failed:', error);
    // });

    res.json({
      success: true,
      data: {
        message: 'Google Drive가 연동되었습니다! 🎉',
        googleDriveConnected: true,
        scanStarted: false // Will be true in Story 2.2
      }
    });
  } catch (error: unknown) {
    console.error('OAuth callback error:', error);

    // Handle Google API errors properly
    const err = error as { code?: number; errors?: Array<{ reason?: string }> };

    // Check for quota exceeded (429) or other Google API errors
    if (err.code === 429 || (err.errors?.[0]?.reason === 'quotaExceeded')) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Google API quota를 초과했습니다. 1시간 후에 다시 시도해주세요.'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_FAILED',
        message: 'OAuth 연동에 실패했습니다'
      }
    });
  }
});

/**
 * GET /api/v1/google-drive/status
 * Check Google Drive connection status
 */
router.get('/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { rows } = await pool.query(
      'SELECT google_drive_connected FROM profiles WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        googleDriveConnected: rows[0]?.google_drive_connected || false
      }
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_CHECK_FAILED',
        message: '연동 상태 확인에 실패했습니다'
      }
    });
  }
});

/**
 * DELETE /api/v1/google-drive/disconnect
 * Disconnect Google Drive (delete tokens and CASCADE delete all user data)
 */
router.delete('/disconnect', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await googleOAuthService.deleteTokens(userId);

    res.json({
      success: true,
      data: {
        message: 'Google Drive 연동이 해제되었습니다.',
        googleDriveConnected: false
      }
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DISCONNECT_FAILED',
        message: '연동 해제에 실패했습니다'
      }
    });
  }
});

/**
 * POST /api/v1/google-drive/reconnect
 * Reconnect Google Drive (get new auth URL for existing user)
 */
router.post('/reconnect', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    // Use cryptographically secure random generation for OAuth state
    const state = crypto.randomBytes(32).toString('hex');
    const authUrl = googleOAuthService.getAuthUrl(state);

    res.json({
      success: true,
      data: {
        authUrl,
        state,
        message: 'Google Drive 재연동 URL이 생성되었습니다.'
      }
    });
  } catch (error) {
    console.error('Error generating reconnect URL:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RECONNECT_ERROR',
        message: '재연동 URL 생성에 실패했습니다'
      }
    });
  }
});

export default router;
