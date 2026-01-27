/**
 * Node Canvas Routes
 * API endpoints for node UI management (drag-and-drop, editing, etc.)
 * Story 6.2: Node Drag-and-Drop and Editing
 */

import { Router, Response, Request } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import pool from '../../utils/db';

const router = Router();

/**
 * PUT /api/v1/documents/:documentId/nodes
 * Update node positions and metadata
 */
router.put('/documents/:documentId/nodes', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DOCUMENT_ID', message: 'Document ID is required' },
      });
    }
    const { nodes } = req.body;

    // Validate that nodes is an array
    if (!Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NODES',
          message: 'Nodes must be an array',
        },
      });
    }

    // Verify document ownership
    const documentCheck = await pool.query(
      'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (documentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    // Update nodes in database
    const result = await pool.query(
      'UPDATE documents SET nodes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [JSON.stringify(nodes), documentId]
    );

    res.json({
      success: true,
      data: {
        nodes: result.rows[0].nodes,
      },
      message: '노드 위치가 저장되었습니다',
    });
  } catch (error) {
    console.error('Failed to update nodes:', error);
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
 * PATCH /api/v1/documents/:documentId/nodes/:nodeId
 * Update a single node's data
 */
router.patch(
  '/documents/:documentId/nodes/:nodeId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
      }
      const userId = user.id;

      const documentId = req.params.documentId;
      const nodeId = req.params.nodeId;
      const updates = req.body; // { title, color, icon, notes, position }

      // Verify document ownership
      const documentCheck = await pool.query(
        'SELECT id, nodes FROM documents WHERE id = $1 AND user_id = $2',
        [documentId, userId]
      );

      if (documentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '문서를 찾을 수 없습니다',
          },
        });
      }

      // Get current nodes
      const nodes = documentCheck.rows[0].nodes || [];
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

      // Update node data
      nodes[nodeIndex] = {
        ...nodes[nodeIndex],
        ...updates,
        id: nodeId, // Preserve ID
      };

      // Save to database
      await pool.query(
        'UPDATE documents SET nodes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [JSON.stringify(nodes), documentId]
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
  }
);

/**
 * DELETE /api/v1/documents/:documentId/nodes/:nodeId
 * Delete a single node
 */
router.delete(
  '/documents/:documentId/nodes/:nodeId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
      }
      const userId = user.id;

      const documentId = req.params.documentId;
      const nodeId = req.params.nodeId;

      // Verify document ownership
      const documentCheck = await pool.query(
        'SELECT id, nodes FROM documents WHERE id = $1 AND user_id = $2',
        [documentId, userId]
      );

      if (documentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '문서를 찾을 수 없습니다',
          },
        });
      }

      // Filter out the node to delete
      const nodes = documentCheck.rows[0].nodes || [];
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

      // Save to database
      await pool.query('UPDATE documents SET nodes = $1, updated_at = NOW() WHERE id = $2', [
        JSON.stringify(filteredNodes),
        documentId,
      ]);

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
  }
);

/**
 * POST /api/v1/documents/:documentId/nodes/:nodeId/duplicate
 * Duplicate a node
 */
router.post(
  '/documents/:documentId/nodes/:nodeId/duplicate',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
      }
      const userId = user.id;

      const documentId = req.params.documentId;
      const nodeId = req.params.nodeId;

      // Verify document ownership
      const documentCheck = await pool.query(
        'SELECT id, nodes FROM documents WHERE id = $1 AND user_id = $2',
        [documentId, userId]
      );

      if (documentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '문서를 찾을 수 없습니다',
          },
        });
      }

      // Find node to duplicate
      const nodes = documentCheck.rows[0].nodes || [];
      const nodeToDuplicate = nodes.find((n: any) => n.id === nodeId);

      if (!nodeToDuplicate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NODE_NOT_FOUND',
            message: '노드를 찾을 수 없습니다',
          },
        });
      }

      // Create duplicate node with new ID and offset position
      const duplicateNode = {
        ...nodeToDuplicate,
        id: `node-${Date.now()}`,
        position: {
          x: (nodeToDuplicate.position?.x || 0) + 50,
          y: (nodeToDuplicate.position?.y || 0) + 50,
        },
        data: {
          ...nodeToDuplicate.data,
          label: `${nodeToDuplicate.data?.label || 'Node'} (복제본)`,
        },
      };

      // Add to nodes array
      nodes.push(duplicateNode);

      // Save to database
      await pool.query(
        'UPDATE documents SET nodes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [JSON.stringify(nodes), documentId]
      );

      res.status(201).json({
        success: true,
        data: duplicateNode,
        message: '노드가 복제되었습니다',
      });
    } catch (error) {
      console.error('Failed to duplicate node:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DUPLICATE_FAILED',
          message: '노드 복제에 실패했습니다',
        },
      });
    }
  }
);

export default router;
