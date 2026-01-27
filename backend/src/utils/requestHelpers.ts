import { Request } from 'express';
import { AuthenticatedUser } from '../middleware/auth.middleware';

/**
 * Helper function to get authenticated user from request
 * This is needed because Passport's TypeScript definitions override Express's Request.user type
 */
export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  const user = (req as any).user;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user as AuthenticatedUser;
}
