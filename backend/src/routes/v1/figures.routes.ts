/**
 * Document Figures Routes
 * API endpoints for managing charts and infographics
 */

import { Router, Response } from 'express';
import { figureService } from '../../services/figure.service';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/figures/:documentId
 * Get all figures for a document
 */
router.get('/:documentId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId;
    const figures = await figureService.getDocumentFigures(documentId);

    res.json({
      success: true,
      data: figures,
    });
  } catch (error) {
    console.error('Failed to fetch figures:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch figures',
      },
    });
  }
});

/**
 * POST /api/v1/figures/:figureId/regenerate
 * Regenerate a figure (placeholder for future AI image generation)
 */
router.post(
  '/:figureId/regenerate',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const figureId = req.params.figureId;

      // For MVP: this just updates the placeholder text
      const regeneratedFigure = await figureService.regenerateFigure(figureId);

      res.json({
        success: true,
        data: regeneratedFigure,
        message: 'Figure regenerated successfully (MVP: placeholder updated)',
      });
    } catch (error: any) {
      if (error.message === 'Figure not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Figure not found',
          },
        });
      }

      console.error('Failed to regenerate figure:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGENERATE_FAILED',
          message: 'Failed to regenerate figure',
        },
      });
    }
  }
);

/**
 * DELETE /api/v1/figures/:figureId
 * Delete a figure
 */
router.delete('/:figureId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const figureId = req.params.figureId;
    await figureService.deleteFigure(figureId);

    res.json({
      success: true,
      data: {
        message: 'Figure deleted successfully',
      },
    });
  } catch (error) {
    console.error('Failed to delete figure:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete figure',
      },
    });
  }
});

export default router;
