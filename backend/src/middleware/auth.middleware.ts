import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabaseAdmin';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: Missing or invalid token',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: Invalid token',
          code: 'INVALID_TOKEN',
        },
      });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
