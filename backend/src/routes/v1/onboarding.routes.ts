import { Router, Response } from 'express';
import { verifyToken } from '../../utils/auth';
import pool from '../../utils/db';
import type { OnboardingInput } from '../../../../shared/types/onboarding.types';

const router = Router();

// Helper: Get user ID from JWT
async function getUserIdFromRequest(req: any): Promise<string | null> {
  const accessToken = req.cookies.access_token;
  if (!accessToken) return null;

  const payload = verifyToken(accessToken);
  if (!payload) return null;

  return payload.userId;
}

// GET /api/v1/onboarding - Get current onboarding progress
router.get('/', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const { rows: [onboarding] } = await pool.query(
      'SELECT * FROM onboarding_responses WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: { onboarding: onboarding || null }
    });
  } catch (error) {
    console.error('Error fetching onboarding:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch onboarding' }
    });
  }
});

// POST /api/v1/onboarding/save - Save onboarding step (upsert)
router.post('/save', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const { step, ...input }: { step: 1 | 2 | 3 } & OnboardingInput = req.body;

    if (!step || step < 1 || step > 3) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STEP', message: 'Step must be 1, 2, or 3' }
      });
    }

    // Get existing onboarding
    const { rows: [existing] } = await pool.query(
      'SELECT * FROM onboarding_responses WHERE user_id = $1',
      [userId]
    );

    // Build update data
    const updateData: any = {
      user_id: userId,
      step,
      vision: existing?.vision || input.vision || null,
      target_customer: existing?.target_customer || input.target_customer || null,
      current_stage: existing?.current_stage || input.current_stage || null,
    };

    // Merge new input
    if (input.vision) updateData.vision = input.vision;
    if (input.target_customer) updateData.target_customer = input.target_customer;
    if (input.current_stage) updateData.current_stage = input.current_stage;

    // Set completed_at if step 3
    if (step === 3) {
      updateData.completed_at = new Date();
    }

    // Upsert
    const { rows: [onboarding] } = await pool.query(
      `INSERT INTO onboarding_responses (user_id, step, vision, target_customer, current_stage, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         step = EXCLUDED.step,
         vision = COALESCE(EXCLUDED.vision, onboarding_responses.vision),
         target_customer = COALESCE(EXCLUDED.target_customer, onboarding_responses.target_customer),
         current_stage = COALESCE(EXCLUDED.current_stage, onboarding_responses.current_stage),
         completed_at = COALESCE(EXCLUDED.completed_at, onboarding_responses.completed_at),
         updated_at = NOW()
       RETURNING *`,
      [
        updateData.user_id,
        updateData.step,
        updateData.vision,
        updateData.target_customer,
        updateData.current_stage,
        updateData.completed_at,
      ]
    );

    res.json({
      success: true,
      data: { onboarding }
    });
  } catch (error) {
    console.error('Error saving onboarding:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save onboarding' }
    });
  }
});

// POST /api/v1/onboarding/complete - Complete onboarding
router.post('/complete', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    // Update profile
    await pool.query(
      'UPDATE profiles SET onboarding_completed = true WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: { message: 'Onboarding completed successfully' }
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete onboarding' }
    });
  }
});

// POST /api/v1/onboarding/reset - Reset onboarding
router.post('/reset', async (req: any, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    // Delete onboarding responses
    await pool.query(
      'DELETE FROM onboarding_responses WHERE user_id = $1',
      [userId]
    );

    // Reset profile flag
    await pool.query(
      'UPDATE profiles SET onboarding_completed = false WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: { message: 'Onboarding reset successfully' }
    });
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reset onboarding' }
    });
  }
});

export default router;
