import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

/**
 * Authenticated user interface
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Authenticated Request interface with user property
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Middleware to verify JWT token from cookies
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Authentication required'
      }
    });
    return;
  }

  const payload = verifyToken(accessToken);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
    return;
  }

  // Attach user info to request
  req.user = {
    id: payload.userId,
    email: payload.email
  };

  next();
}
