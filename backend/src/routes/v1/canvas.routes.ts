/**
 * Lean Startup Canvas Routes
 * API endpoints for 린스타트업 캔버스 (Epic 2-6)
 *
 * 독립적인 캔버스를 documents 테이블과 분리하여 관리
 */

import { Router, Response, Request } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import pool from '../../utils/db';

const router = Router();

/**
 * GET /api/v1/canvas
 * 사용자의 활성 캔버스 조회
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;

    // 활성 캔버스 조회
    const result = await pool.query(
      `SELECT * FROM lean_startup_canvases
       WHERE user_id = $1 AND is_active = true
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // 캔버스가 없으면 새로 생성
      const createResult = await pool.query(
        `INSERT INTO lean_startup_canvases (user_id, nodes, edges, progressive_disclosure, stage_completion, title)
         VALUES ($1, '[]', '[]', '{"unlocked_stages": [1, 2, 3], "show_all": false}', '{}', '린스타트업 캔버스')
         RETURNING *`,
        [userId]
      );

      return res.json({
        success: true,
        data: createResult.rows[0],
        message: '새 캔버스가 생성되었습니다',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Failed to load canvas:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOAD_FAILED',
        message: '캔버스 로드에 실패했습니다',
      },
    });
  }
});

/**
 * PUT /api/v1/canvas/save
 * 캔버스 저장 (자동 저장용 - Story 5.1)
 */
router.put('/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;
    const { nodes, edges, progressive_disclosure, stage_completion } = req.body;

    // 유효성 검사
    if (!Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NODES',
          message: 'Nodes must be an array',
        },
      });
    }

    if (!Array.isArray(edges)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EDGES',
          message: 'Edges must be an array',
        },
      });
    }

    // 활성 캔버스 찾기 또는 생성
    const existingCanvas = await pool.query(
      `SELECT id FROM lean_startup_canvases
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      [userId]
    );

    let result;
    if (existingCanvas.rows.length > 0) {
      // 기존 캔버스 업데이트
      result = await pool.query(
        `UPDATE lean_startup_canvases
         SET nodes = $1, edges = $2,
             progressive_disclosure = COALESCE($3, progressive_disclosure),
             stage_completion = COALESCE($4, stage_completion),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          JSON.stringify(nodes),
          JSON.stringify(edges),
          progressive_disclosure ? JSON.stringify(progressive_disclosure) : null,
          stage_completion ? JSON.stringify(stage_completion) : null,
          existingCanvas.rows[0].id,
        ]
      );
    } else {
      // 새 캔버스 생성
      result = await pool.query(
        `INSERT INTO lean_startup_canvases (user_id, nodes, edges, progressive_disclosure, stage_completion)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          userId,
          JSON.stringify(nodes),
          JSON.stringify(edges),
          JSON.stringify(progressive_disclosure || { unlocked_stages: [1, 2, 3], show_all: false }),
          JSON.stringify(stage_completion || {}),
        ]
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: '캔버스가 저장되었습니다',
    });
  } catch (error) {
    console.error('Failed to save canvas:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SAVE_FAILED',
        message: '캔버스 저장에 실패했습니다',
      },
    });
  }
});

/**
 * PATCH /api/v1/canvas/nodes/:nodeId
 * 단일 노드 업데이트
 */
router.patch('/nodes/:nodeId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;
    const nodeId = req.params.nodeId;
    const updates = req.body;

    // 활성 캔버스 조회
    const canvasResult = await pool.query(
      `SELECT id, nodes FROM lean_startup_canvases
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

    const canvas = canvasResult.rows[0];
    const nodes = canvas.nodes || [];
    const nodeIndex = nodes.findIndex((n: any) => n.id === nodeId);

    if (nodeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: '노드를 찾을 수 없습니다',
        },
      });
    }

    // 노드 업데이트
    nodes[nodeIndex] = {
      ...nodes[nodeIndex],
      ...updates,
      id: nodeId,
    };

    // 저장
    await pool.query(
      `UPDATE lean_startup_canvases
       SET nodes = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(nodes), canvas.id]
    );

    res.json({
      success: true,
      data: nodes[nodeIndex],
      message: '노드가 업데이트되었습니다',
    });
  } catch (error) {
    console.error('Failed to update node:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: '노드 업데이트에 실패했습니다',
      },
    });
  }
});

/**
 * DELETE /api/v1/canvas/nodes/:nodeId
 * 노드 삭제
 */
router.delete('/nodes/:nodeId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;
    const nodeId = req.params.nodeId;

    // 활성 캔버스 조회
    const canvasResult = await pool.query(
      `SELECT id, nodes, edges FROM lean_startup_canvases
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

    const canvas = canvasResult.rows[0];
    const nodes = canvas.nodes || [];
    const edges = canvas.edges || [];

    // 노드 삭제
    const filteredNodes = nodes.filter((n: any) => n.id !== nodeId);

    if (filteredNodes.length === nodes.length) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: '노드를 찾을 수 없습니다',
        },
      });
    }

    // 연결된 엣지도 삭제
    const filteredEdges = edges.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

    // 저장
    await pool.query(
      `UPDATE lean_startup_canvases
       SET nodes = $1, edges = $2, updated_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(filteredNodes), JSON.stringify(filteredEdges), canvas.id]
    );

    res.json({
      success: true,
      message: '노드가 삭제되었습니다',
    });
  } catch (error) {
    console.error('Failed to delete node:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: '노드 삭제에 실패했습니다',
      },
    });
  }
});

/**
 * POST /api/v1/canvas/unlock-stage
 * Progressive Disclosure: 다음 스테이지 해제
 */
router.post('/unlock-stage', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const userId = user.id;
    const { stage } = req.body;

    if (!stage || stage < 1 || stage > 7) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STAGE',
          message: '스테이지는 1-7 사이여야 합니다',
        },
      });
    }

    // 활성 캔버스 조회
    const canvasResult = await pool.query(
      `SELECT id, progressive_disclosure FROM lean_startup_canvases
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

    const canvas = canvasResult.rows[0];
    const progressiveDisclosure = canvas.progressive_disclosure || {
      unlocked_stages: [1, 2, 3],
      show_all: false,
    };

    // 스테이지 추가
    if (!progressiveDisclosure.unlocked_stages.includes(stage)) {
      progressiveDisclosure.unlocked_stages.push(stage);
      progressiveDisclosure.unlocked_stages.sort((a: number, b: number) => a - b);
    }

    // 3개 이상 완료 시 전체 해제
    if (progressiveDisclosure.unlocked_stages.length >= 3) {
      progressiveDisclosure.show_all = true;
      progressiveDisclosure.unlocked_stages = [1, 2, 3, 4, 5, 6, 7];
    }

    // 저장
    await pool.query(
      `UPDATE lean_startup_canvases
       SET progressive_disclosure = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(progressiveDisclosure), canvas.id]
    );

    res.json({
      success: true,
      data: progressiveDisclosure,
      message: `스테이지 ${stage}가 해제되었습니다`,
    });
  } catch (error) {
    console.error('Failed to unlock stage:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UNLOCK_FAILED',
        message: '스테이지 해제에 실패했습니다',
      },
    });
  }
});

export default router;
