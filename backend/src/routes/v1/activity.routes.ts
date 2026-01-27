import { Router, Response, Request } from 'express';
import activityService from '../../services/activity.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/activity/team/:teamId
 * Get team activity logs
 */
router.get('/team/:teamId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TEAM_ID', message: 'Team ID is required' },
      });
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const action_type = req.query.action_type as string | undefined;
    const member_id = req.query.member_id as string | undefined;
    const date_range = req.query.date_range as '7d' | '30d' | 'custom' | undefined;

    const result = await activityService.getTeamActivityLogs(teamId, userId, {
      limit,
      offset,
      action_type,
      member_id,
      date_range,
    });

    res.json({
      success: true,
      data: result.activities,
      pagination: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);

    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch activity logs';

    if (errorMessage === 'User is not a member of this team') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '이 팀의 활동 로그에 접근할 권한이 없습니다',
        },
      });
    }

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
 * GET /api/v1/activity/team/:teamId/metrics
 * Get team metrics
 */
router.get('/team/:teamId/metrics', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TEAM_ID', message: 'Team ID is required' },
      });
    }
    const metrics = await activityService.getTeamMetrics(teamId, userId);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Failed to fetch team metrics:', error);

    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team metrics';

    if (errorMessage === 'User is not a member of this team') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '이 팀의 메트릭에 접근할 권한이 없습니다',
        },
      });
    }

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
 * GET /api/v1/activity/team/:teamId/stats
 * Get team activity statistics
 */
router.get('/team/:teamId/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TEAM_ID', message: 'Team ID is required' },
      });
    }
    const stats = await activityService.getTeamActivityStats(teamId, userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to fetch team stats:', error);

    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team stats';

    if (errorMessage === 'User is not a member of this team') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '이 팀의 통계에 접근할 권한이 없습니다',
        },
      });
    }

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
