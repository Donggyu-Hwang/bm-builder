// Type declaration for Express Request with custom user property
// Must NOT import passport to avoid type conflicts

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
