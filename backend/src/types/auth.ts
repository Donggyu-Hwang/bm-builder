/**
 * Custom authentication types
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Augment Express Request to include our custom user type
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
