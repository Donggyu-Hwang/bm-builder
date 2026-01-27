/**
 * Pitch Deck Routes
 * API endpoints for pitch deck generation and slide management
 */

import { Router, Response, Request } from 'express';
import { pitchDeckService } from '../../services/pitchDeck.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/v1/pitch-deck/start
 * Start pitch deck generation
 */
router.post('/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ANSWERS',
          message: 'Interview answers are required',
        },
      });
    }

    const documentId = await pitchDeckService.generatePitchDeck({
      userId,
      answers,
    });

    res.json({
      success: true,
      data: {
        document_id: documentId,
        message: '피칭 데크 생성이 시작되었습니다',
      },
    });
  } catch (error) {
    console.error('Failed to start pitch deck generation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: 'Failed to start pitch deck generation',
      },
    });
  }
});

/**
 * GET /api/v1/pitch-deck/:documentId/slides
 * Get all slides for a pitch deck
 */
router.get('/:documentId/slides', requireAuth, async (req: Request, res: Response) => {
  try {
    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const slides = await pitchDeckService.getSlides(documentId);

    res.json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error('Failed to fetch slides:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch slides',
      },
    });
  }
});

/**
 * PUT /api/v1/pitch-deck/slides/:slideId
 * Update slide content
 */
router.put('/slides/:slideId', requireAuth, async (req: Request, res: Response) => {
  try {
    const slideId = req.params.slideId;
    if (!slideId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Slide ID is required' },
      });
    }
    const { title, content, notes } = req.body;

    await pitchDeckService.updateSlide(slideId, { title, content, notes });

    res.json({
      success: true,
      data: {
        message: 'Slide updated successfully',
      },
    });
  } catch (error) {
    console.error('Failed to update slide:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update slide',
      },
    });
  }
});

/**
 * PUT /api/v1/pitch-deck/slides/:slideId/reorder
 * Reorder slide (change slide number)
 */
router.put('/slides/:slideId/reorder', requireAuth, async (req: Request, res: Response) => {
  try {
    const slideId = req.params.slideId;
    if (!slideId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Slide ID is required' },
      });
    }
    const { new_order } = req.body;

    if (typeof new_order !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ORDER',
          message: 'New order number is required',
        },
      });
    }

    await pitchDeckService.reorderSlide(slideId, new_order);

    res.json({
      success: true,
      data: {
        message: 'Slide reordered successfully',
      },
    });
  } catch (error) {
    console.error('Failed to reorder slide:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REORDER_FAILED',
        message: 'Failed to reorder slide',
      },
    });
  }
});

/**
 * DELETE /api/v1/pitch-deck/slides/:slideId
 * Delete a slide
 */
router.delete('/slides/:slideId', requireAuth, async (req: Request, res: Response) => {
  try {
    const slideId = req.params.slideId;
    if (!slideId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Slide ID is required' },
      });
    }
    await pitchDeckService.deleteSlide(slideId);

    res.json({
      success: true,
      data: {
        message: 'Slide deleted successfully',
      },
    });
  } catch (error) {
    console.error('Failed to delete slide:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete slide',
      },
    });
  }
});

export default router;
