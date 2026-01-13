import { Request, Response, NextFunction } from 'express';
import type { ApiError } from '@shared/types/errors';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export default function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const error: ApiError = {
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    details: err.details,
  };

  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error,
  });
}
