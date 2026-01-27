/**
 * WebSocket Auth Routes
 * Provides temporary JWT tokens for WebSocket authentication
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthenticatedUser } from '../../middleware/auth.middleware';
import { getJWTAccessSecret } from '../../utils/auth';

const router = express.Router();

/**
 * POST /api/v1/websocket/token
 * Get a temporary JWT token for WebSocket authentication
 */
router.post('/token', authenticateToken, async (req, res) => {
  try {
    // CRITICAL FIX: Use centralized JWT validation function
    const jwtSecret = getJWTAccessSecret();

    const user = req.user as AuthenticatedUser;

    // Create a short-lived token for WebSocket (5 minutes)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: '5m',
      }
    );

    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    console.error('Error generating WebSocket token:', error);

    // Handle validation errors properly
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message.includes('JWT_ACCESS_SECRET')
          ? 'WebSocket authentication not properly configured'
          : 'Failed to generate token',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate token',
    });
  }
});

export default router;
