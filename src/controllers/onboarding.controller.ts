import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as onboardingService from '../services/onboarding.service';

export async function saveResponse(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const { step, response } = req.body;

    if (step === undefined || !response) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Step and response are required',
          code: 'MISSING_FIELDS',
        },
      });
    }

    const result = await onboardingService.saveResponse(req.user.id, step, response);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to save response',
        code: 'SAVE_RESPONSE_FAILED',
      },
    });
  }
}

export async function getResponses(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const responses = await onboardingService.getResponses(req.user.id);

    res.json({
      success: true,
      data: responses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch responses',
        code: 'FETCH_RESPONSES_FAILED',
      },
    });
  }
}

export async function completeOnboarding(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }

    await onboardingService.completeOnboarding(req.user.id);

    res.json({
      success: true,
      data: { message: 'Onboarding completed successfully' },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to complete onboarding',
        code: 'COMPLETE_ONBOARDING_FAILED',
      },
    });
  }
}
