import { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import type { OnboardingStep } from '../../../frontend/src/types/onboarding';
import * as onboardingService from '../services/onboarding.service';

export async function saveResponse(req: AuthRequest, res: Response) {
  try {
    const { step, response } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await onboardingService.saveResponse(
      req.user.id,
      step as OnboardingStep,
      response as string
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to save response',
        code: 'SAVE_ERROR',
      },
    });
  }
}

export async function getResponses(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await onboardingService.getResponses(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get responses',
        code: 'GET_ERROR',
      },
    });
  }
}

export async function completeOnboarding(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    await onboardingService.completeOnboarding(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to complete onboarding',
        code: 'COMPLETE_ERROR',
      },
    });
  }
}
