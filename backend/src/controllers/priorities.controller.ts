import { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import type { PriorityItem } from '../../../frontend/src/types/priorities';
import * as prioritiesService from '../services/priorities.service';

export async function generatePriorities(req: AuthRequest, res: Response) {
  try {
    const { onboardingResponses } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await prioritiesService.generatePriorities(
      req.user.id,
      onboardingResponses as string
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to generate priorities',
        code: 'GENERATE_ERROR',
      },
    });
  }
}

export async function getPriorities(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await prioritiesService.getPriorities(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get priorities',
        code: 'GET_ERROR',
      },
    });
  }
}

export async function updatePriorities(req: AuthRequest, res: Response) {
  try {
    const { priorities } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await prioritiesService.updatePriorities(
      req.user.id,
      priorities as PriorityItem[]
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update priorities',
        code: 'UPDATE_ERROR',
      },
    });
  }
}
