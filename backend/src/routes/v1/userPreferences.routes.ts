import { Router } from 'express';
import {
  getUserPreferences,
  updateThemePreference,
  updateShowTooltipsPreference,
} from '../../services/userPreferences.service';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/v1/user-preferences
 * Get current user's preferences
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const preferences = await getUserPreferences(userId);

    return res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user preferences',
      },
    });
  }
});

/**
 * PUT /api/v1/user-preferences/theme
 * Update user's theme preference
 * Body: { themePreference: 'light' | 'dark' | 'system' }
 */
router.put('/theme', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const { themePreference } = req.body;

    // Validate theme preference
    if (!themePreference || !['light', 'dark', 'system'].includes(themePreference)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_THEME_PREFERENCE',
          message: 'Theme preference must be one of: light, dark, system',
        },
      });
    }

    const preferences = await updateThemePreference(userId, themePreference);

    return res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error updating theme preference:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update theme preference',
      },
    });
  }
});

/**
 * PUT /api/v1/user-preferences/tooltips
 * Update user's show tooltips preference
 * Body: { showTooltips: boolean }
 */
router.put('/tooltips', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const { showTooltips } = req.body;

    // Validate showTooltips
    if (typeof showTooltips !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SHOW_TOOLTIPS',
          message: 'showTooltips must be a boolean',
        },
      });
    }

    const preferences = await updateShowTooltipsPreference(userId, showTooltips);

    return res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error updating tooltips preference:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update tooltips preference',
      },
    });
  }
});

export default router;
