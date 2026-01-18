import { Router, Response } from 'express';
import { verifyToken } from '../../utils/auth';
import pool from '../../utils/db';
import { claudeService } from '../../services/claude.service';

const router = Router();

// Helper: Get user ID from JWT
async function getUserIdFromRequest(req: any): Promise<string | null> {
  const accessToken = req.cookies.access_token;
  if (!accessToken) return null;

  const payload = verifyToken(accessToken);
  if (!payload) return null;

  return payload.userId;
}

// POST /api/v1/priorities/generate - Generate AI priorities
router.post('/generate', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { vision, target_customer, current_stage } = req.body;

    // Validate input
    if (!vision || !target_customer || !current_stage) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '온보딩 정보가 부족합니다' },
      });
    }

    // Generate priorities using Claude
    const { priorities, error: aiError } = await claudeService.generatePriorities({
      vision,
      targetCustomer: target_customer,
      currentStage: current_stage,
    });

    // Save to database
    await pool.query(
      `INSERT INTO daily_priorities (user_id, priorities, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         priorities = EXCLUDED.priorities,
         source = EXCLUDED.source,
         updated_at = NOW()
       RETURNING *`,
      [userId, JSON.stringify(priorities), aiError ? 'manual' : 'ai_suggestion']
    );

    res.json({
      success: true,
      data: {
        priorities,
        source: aiError ? 'manual' : 'ai_suggestion',
        error: aiError,
      },
    });
  } catch (error) {
    console.error('Error generating priorities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '제안 생성 실패' },
    });
  }
});

// GET /api/v1/priorities - Get current priorities
router.get('/', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { rows: [priorities] } = await pool.query(
      'SELECT * FROM daily_priorities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!priorities) {
      return res.json({
        success: true,
        data: { priorities: [], source: 'manual' },
      });
    }

    res.json({
      success: true,
      data: {
        priorities: priorities.priorities || [],
        source: priorities.source,
      },
    });
  } catch (error) {
    console.error('Error fetching priorities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '조회 실패' },
    });
  }
});

// PUT /api/v1/priorities - Update priorities
router.put('/', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { priorities } = req.body;

    if (!Array.isArray(priorities)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'priorities must be an array' },
      });
    }

    const { rows: [savedPriorities] } = await pool.query(
      `INSERT INTO daily_priorities (user_id, priorities, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         priorities = EXCLUDED.priorities,
         source = EXCLUDED.source,
         updated_at = NOW()
       RETURNING *`,
      [userId, JSON.stringify(priorities), 'manual']
    );

    res.json({
      success: true,
      data: { priorities: savedPriorities.priorities },
    });
  } catch (error) {
    console.error('Error updating priorities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '저장 실패' },
    });
  }
});

export default router;
