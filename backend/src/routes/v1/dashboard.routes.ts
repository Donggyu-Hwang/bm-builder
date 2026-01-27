import { Router, Response, Request } from 'express';
import dashboardService from '../../services/dashboard.service';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/dashboard/user
 * Get user dashboard statistics
 */
router.get('/user', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const stats = await dashboardService.getUserDashboardStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Failed to fetch user dashboard stats:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/dashboard/progress
 * Get project progress summary
 */
router.get('/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const progress = await dashboardService.getProjectProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Failed to fetch project progress:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch project progress';

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/dashboard/admin
 * Get admin dashboard statistics
 * CRITICAL FIX: Now requires admin role
 */
router.get('/admin', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getAdminDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Failed to fetch admin dashboard stats:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch admin dashboard stats';

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

export default router;
