import { Router, Response } from 'express';
import passport from '../../config/passport';
import { generateTokens, verifyToken, verifyRefreshToken } from '../../utils/auth';
import pool from '../../utils/db';

const router = Router();

// GET /api/v1/auth/google - Google OAuth 시작
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// GET /api/v1/auth/google/callback - OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: any, res) => {
    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: req.user.id,
      email: req.user.email
    });

    // Store refresh token in database
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')
       ON CONFLICT (user_id) DO UPDATE SET
         token = EXCLUDED.token,
         expires_at = NOW() + INTERVAL '7 days'`,
      [req.user.id, refreshToken]
    );

    // Set HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800000 // 7 days
    });

    // Redirect to dashboard
    res.redirect(`${process.env.CORS_ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/dashboard`);
  }
);

// POST /api/v1/auth/refresh - Token 갱신
router.post('/refresh', async (req: any, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided' }
    });
  }

  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' }
    });
  }

  // Check if refresh token exists in database
  const { rows: [tokenRow] } = await pool.query(
    'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [refreshToken]
  );

  if (!tokenRow) {
    return res.status(401).json({
      success: false,
      error: { code: 'EXPIRED_REFRESH_TOKEN', message: 'Refresh token expired' }
    });
  }

  // Get user info
  const { rows: [user] } = await pool.query(
    'SELECT id, email, full_name, avatar_url FROM profiles WHERE id = $1',
    [tokenRow.user_id]
  );

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    userId: user.id,
    email: user.email
  });

  // Update refresh token in database
  await pool.query(
    `UPDATE refresh_tokens
     SET token = $1, expires_at = NOW() + INTERVAL '7 days'
     WHERE user_id = $2`,
    [newRefreshToken, user.id]
  );

  // Set new cookies
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600000
  });

  res.cookie('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800000
  });

  res.json({
    success: true,
    data: { user }
  });
});

// GET /api/v1/auth/me - Get current user
router.get('/me', async (req: any, res: Response) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Not authenticated' }
    });
  }

  const payload = verifyToken(accessToken);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }

  const { rows: [user] } = await pool.query(
    'SELECT id, email, full_name, avatar_url, onboarding_completed, welcome_shown FROM profiles WHERE id = $1',
    [payload.userId]
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' }
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

// POST /api/v1/auth/logout - Logout
router.post('/logout', async (req: any, res: Response) => {
  // Clear refresh token from database
  const refreshToken = req.cookies.refresh_token;

  if (refreshToken) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );
  }

  // Clear cookies
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');

  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

// POST /api/v1/profile/welcome-shown - Mark welcome as shown
router.post('/profile/welcome-shown', async (req: any, res: Response) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Not authenticated' }
    });
  }

  const payload = verifyToken(accessToken);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }

  try {
    await pool.query(
      'UPDATE profiles SET welcome_shown = TRUE WHERE id = $1',
      [payload.userId]
    );

    res.json({
      success: true,
      data: { message: 'Welcome marked as shown' }
    });
  } catch (error) {
    console.error('Error marking welcome as shown:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark welcome as shown' }
    });
  }
});

export default router;
