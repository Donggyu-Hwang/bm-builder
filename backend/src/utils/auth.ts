import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
}

// Get JWT secret with validation
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

// Get JWT refresh secret (falls back to JWT_SECRET)
function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || getJWTSecret();
}

// Generate JWT token pair
export function generateTokens(payload: JWTPayload) {
  const accessToken = jwt.sign(
    payload,
    getJWTSecret(),
    { expiresIn: '1h' } // Access token: 1 hour
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    getRefreshSecret(),
    { expiresIn: '7d' } // Refresh token: 7 days
  );

  return { accessToken, refreshToken };
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, getRefreshSecret()) as { userId: string };
  } catch (error) {
    return null;
  }
}

/**
 * Validate and get JWT access secret
 * CRITICAL FIX: Centralized validation to prevent duplication
 * Used by WebSocket authentication
 */
export function getJWTAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET or JWT_SECRET environment variable is required');
  }

  // Reject placeholder values
  const invalidPlaceholders = ['your-secret-key', 'your-jwt-secret', 'secret', 'change-me'];

  const normalizedSecret = secret.toLowerCase().trim();
  if (invalidPlaceholders.some((placeholder) => normalizedSecret.includes(placeholder))) {
    throw new Error('JWT_ACCESS_SECRET must be changed from the default placeholder value');
  }

  // Require minimum length for security
  if (secret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long');
  }

  return secret;
}

/**
 * Verify JWT access token (for WebSocket authentication)
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const secret = getJWTAccessSecret();
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}
