import express from 'express';
import pool from '../../utils/db';

const router = express.Router();

/**
 * POST /api/v1/connections
 * Create a new connection between two nodes
 *
 * Story 2.4 AC 2.4.3: Connection data stored in database
 */
router.post('/', async (req, res) => {
  const { sourceNodeId, targetNodeId, sourceAnchor, targetAnchor } = req.body;

  // Validate request body
  if (!sourceNodeId || !targetNodeId || !sourceAnchor || !targetAnchor) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'sourceNodeId, targetNodeId, sourceAnchor, and targetAnchor are required',
      },
    });
  }

  // Validate anchor values
  const validAnchors = ['top', 'bottom', 'left', 'right'];
  if (!validAnchors.includes(sourceAnchor) || !validAnchors.includes(targetAnchor)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'sourceAnchor and targetAnchor must be one of: top, bottom, left, right',
      },
    });
  }

  // Check for self-loop
  if (sourceNodeId === targetNodeId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'SELF_LOOP',
        message: '자기 자신에게는 연결할 수 없습니다',
      },
    });
  }

  try {
    // Check for duplicate connection
    const duplicateCheck = await pool.query(
      'SELECT id FROM connections WHERE source_node_id = $1 AND target_node_id = $2',
      [sourceNodeId, targetNodeId]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_CONNECTION',
          message: '이미 연결된 노드입니다',
        },
      });
    }

    // Create connection
    const result = await pool.query(
      `INSERT INTO connections (source_node_id, target_node_id, source_anchor, target_anchor)
       VALUES ($1, $2, $3, $4)
       RETURNING id, source_node_id as "sourceNodeId", target_node_id as "targetNodeId",
                 source_anchor as "sourceAnchor", target_anchor as "targetAnchor", created_at as "createdAt"`,
      [sourceNodeId, targetNodeId, sourceAnchor, targetAnchor]
    );

    const connection = result.rows[0];

    res.status(201).json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error('[Connections API] Failed to create connection:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '연결 생성에 실패했습니다',
      },
    });
  }
});

/**
 * DELETE /api/v1/connections/:id
 * Delete a connection by ID
 *
 * Story 2.4 AC 2.4.4: Delete connection via API
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM connections WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '연결을 찾을 수 없습니다',
        },
      });
    }

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('[Connections API] Failed to delete connection:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '연결 삭제에 실패했습니다',
      },
    });
  }
});

/**
 * GET /api/v1/nodes/:nodeId/connections
 * Get all connections for a specific node
 */
router.get('/nodes/:nodeId/connections', async (req, res) => {
  const { nodeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, source_node_id as "sourceNodeId", target_node_id as "targetNodeId",
              source_anchor as "sourceAnchor", target_anchor as "targetAnchor", created_at as "createdAt"
       FROM connections
       WHERE source_node_id = $1 OR target_node_id = $1
       ORDER BY created_at DESC`,
      [nodeId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[Connections API] Failed to fetch connections:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '연결 조회에 실패했습니다',
      },
    });
  }
});

export default router;
