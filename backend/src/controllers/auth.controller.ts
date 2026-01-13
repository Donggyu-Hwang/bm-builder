import { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';

export async function signInWithGoogle(req: Request, res: Response) {
  try {
    const result = await authService.signInWithOAuth('google');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Google OAuth failed',
        code: 'OAUTH_ERROR',
      },
    });
  }
}

export async function signInWithNaver(req: Request, res: Response) {
  try {
    const result = await authService.signInWithOAuth('naver');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Naver OAuth failed',
        code: 'OAUTH_ERROR',
      },
    });
  }
}

export async function getSession(req: AuthRequest, res: Response) {
  try {
    const result = await authService.getSession(req.user?.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get session',
        code: 'SESSION_ERROR',
      },
    });
  }
}

export async function signOut(req: Request, res: Response) {
  try {
    await authService.signOut();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Sign out failed',
        code: 'SIGNOUT_ERROR',
      },
    });
  }
}
