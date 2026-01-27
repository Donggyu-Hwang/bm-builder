import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/auth';
import pool from '../utils/db';

/**
 * Custom user type for authenticated requests
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: 'admin' | 'user';
}

/**
 * Extend Express Request interface
 * This is declared in types/express.d.ts but re-declared here for module augmentation
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

/**
 * Middleware to verify JWT token from cookies
 */
export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Authentication required',
      },
    });
    return;
  }

  const payload = verifyToken(accessToken);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
    return;
  }

  // Attach user info to request (type-safe, no 'any' casting)
  req.user = {
    id: payload.userId,
    email: payload.email,
  };

  next();
};

/**
 * Middleware to verify user has admin role
 * CRITICAL FIX: This was imported but not implemented
 */
export const requireAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  try {
    // Check if user has admin role in database
    const { rows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [req.user.id]);

    if (rows.length === 0 || rows[0].role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
      return;
    }

    // Add admin role to user object
    req.user.role = 'admin';
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify admin role',
      },
    });
  }
};

// Export as both requireAuth and authenticateToken for compatibility
export const authenticateToken = requireAuth;

/**
 * Legacy authenticate function for compatibility
 */
export const authenticate = requireAuth;
