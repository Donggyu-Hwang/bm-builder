export interface AppError {
  name: string;
  message: string;
  code: string;
  details?: unknown;
}

export class ErrorWithCode extends Error implements AppError {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ErrorWithCode';
    this.code = code;
    this.details = details;
  }
}

export class AuthError extends ErrorWithCode {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}

export class NetworkError extends ErrorWithCode {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ErrorWithCode {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ErrorWithCode {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

// Type guard for error with message
export function isErrorWithMessage(error: unknown): error is Error & { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

// Convert unknown error to Error with message
export function toErrorWithMessage(maybeError: unknown): Error {
  if (isErrorWithMessage(maybeError)) {
    return maybeError;
  }
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    return new Error(String(maybeError));
  }
}
