import { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as preferencesService from '../services/preferences.service';

export async function getPreferences(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await preferencesService.getPreferences(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to get preferences',
        code: 'GET_ERROR',
      },
    });
  }
}

export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    const { show_tooltips, node_ui_tour_completed } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const result = await preferencesService.updatePreferences(req.user.id, {
      show_tooltips,
      node_ui_tour_completed,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update preferences',
        code: 'UPDATE_ERROR',
      },
    });
  }
}
