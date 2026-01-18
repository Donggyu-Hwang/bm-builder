import { Router, Response, Request } from 'express';
import { glossaryService } from '../../services/glossary.service';

const router = Router();

/**
 * GET /api/v1/glossary/search
 * Search glossary terms by query
 * Query params: q (string) - Search query
 */
router.get('/search', async (req: Request, res: Response): Promise<Response | undefined> => {
  try {
    const { q } = req.query;

    // Validate query parameter
    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        data: [],
      });
    }

    const terms = await glossaryService.searchTerms(q);

    return res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    console.error('Error searching glossary terms:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '용어 검색 실패',
      },
    });
  }
});

/**
 * GET /api/v1/glossary/:id
 * Get glossary term by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<Response | undefined> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: '유효하지 않은 ID입니다',
        },
      });
    }

    const term = await glossaryService.getTermById(id);

    if (!term) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '용어를 찾을 수 없습니다',
        },
      });
    }

    return res.json({
      success: true,
      data: term,
    });
  } catch (error) {
    console.error('Error fetching glossary term:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '용어 조회 실패',
      },
    });
  }
});

/**
 * GET /api/v1/glossary
 * Get all glossary terms (for admin use)
 */
router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const terms = await glossaryService.getAllTerms();

    return res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    console.error('Error fetching all glossary terms:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '용어 목록 조회 실패',
      },
    });
  }
});

export default router;
