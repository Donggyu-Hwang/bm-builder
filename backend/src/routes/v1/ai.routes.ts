/**
 * AI Conversation Routes
 * API endpoints for AI contextual conversation and suggestions (Epic 4.2-4.3)
 */

import { Router, Response, Request } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import pool from '../../utils/db';

const router = Router();

/**
 * POST /api/v1/ai/suggestion
 * AI 제안 생성 (Story 4.3)
 */
router.post('/suggestion', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;
    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'nodeId is required',
        },
      });
    }

    // 활성 캔버스에서 노드 조회
    const canvasResult = await pool.query(
      `SELECT nodes FROM lean_startup_canvases
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      [userId]
    );

    if (canvasResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANVAS_NOT_FOUND',
          message: '캔버스를 찾을 수 없습니다',
        },
      });
    }

    const nodes = canvasResult.rows[0].nodes || [];
    const targetNode = nodes.find((n: any) => n.id === nodeId);

    if (!targetNode) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: '노드를 찾을 수 없습니다',
        },
      });
    }

    // TODO: 실제 Claude API 연동 (현재는 mock)
    const mockSuggestion = {
      id: `suggestion-${Date.now()}`,
      nodeId,
      type: 'content_enhancement',
      content: `"${targetNode.data?.label || '노드'}"에 대한 AI 제안입니다.`,
      reasoning: '이 노드의 내용을 바탕으로 관련 고객 세그먼트와 문제 정의를 개선할 수 있습니다.',
      createdAt: new Date().toISOString(),
      status: 'pending', // pending | approved | rejected
    };

    res.json({
      success: true,
      data: mockSuggestion,
      message: 'AI 제안이 생성되었습니다',
    });
  } catch (error) {
    console.error('Failed to generate AI suggestion:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUGGESTION_FAILED',
        message: 'AI 제안 생성에 실패했습니다',
      },
    });
  }
});

/**
 * POST /api/v1/ai/conversation
 * AI 컨텍스트 대화 (Story 4.2)
 */
router.post('/conversation', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;
    const { nodeId, message } = req.body;

    if (!nodeId || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'nodeId and message are required',
        },
      });
    }

    // 활성 캔버스에서 노드 조회
    const canvasResult = await pool.query(
      `SELECT nodes FROM lean_startup_canvases
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      [userId]
    );

    if (canvasResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANVAS_NOT_FOUND',
          message: '캔버스를 찾을 수 없습니다',
        },
      });
    }

    const nodes = canvasResult.rows[0].nodes || [];
    const targetNode = nodes.find((n: any) => n.id === nodeId);

    if (!targetNode) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: '노드를 찾을 수 없습니다',
        },
      });
    }

    // TODO: 실제 Claude API 연동 (현재는 mock)
    const mockResponse = {
      id: `msg-${Date.now()}`,
      role: 'assistant' as const,
      content: `"${targetNode.data?.label || '노드'}"와 관련하여 "${message}"에 답변합니다. 이 노드는 ${targetNode.data?.description || '설명 없음'}에 관한 것입니다.`,
      nodeId,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockResponse,
      message: 'AI 응답이 생성되었습니다',
    });
  } catch (error) {
    console.error('Failed to generate AI conversation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_FAILED',
        message: 'AI 대화 생성에 실패했습니다',
      },
    });
  }
});

export default router;
