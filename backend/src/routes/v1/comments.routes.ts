import { Router, Response, Request } from 'express';
import commentsService from '../../services/comments.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/comments/document/:documentId
 * Get all comments for a document
 */
router.get('/document/:documentId', requireAuth, async (req: Request, res: Response) => {
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
    const comments = await commentsService.getDocumentComments(documentId, userId);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';

    if (errorMessage === 'User does not have access to this document') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '이 문서에 접근할 권한이 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/comments/thread/:commentId
 * Get a specific comment thread with replies
 */
router.get('/thread/:commentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const commentId = req.params.commentId;
    if (!commentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMMENT_ID', message: 'Comment ID is required' },
      });
    }
    const comment = await commentsService.getCommentThread(commentId, userId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '댓글을 찾을 수 없습니다',
        },
      });
    }

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Failed to fetch comment thread:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comment thread';

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/comments
 * Create a new comment
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const { document_id, content, text_anchor, parent_comment_id } = req.body;

    if (!document_id || !content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '문서 ID와 댓글 내용은 필수 항목입니다',
        },
      });
    }

    const comment = await commentsService.createComment(
      document_id,
      userId,
      content.trim(),
      text_anchor,
      parent_comment_id
    );

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Failed to create comment:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * PATCH /api/v1/comments/:commentId
 * Update a comment
 */
router.patch('/:commentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const commentId = req.params.commentId;
    if (!commentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMMENT_ID', message: 'Comment ID is required' },
      });
    }
    const { content, is_resolved } = req.body;

    const comment = await commentsService.updateComment(commentId, userId, {
      content,
      is_resolved,
    });

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Failed to update comment:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';

    if (errorMessage === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '댓글을 찾을 수 없습니다',
        },
      });
    }

    if (errorMessage === 'User does not have permission to update this comment') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '댓글을 수정할 권한이 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

/**
 * DELETE /api/v1/comments/:commentId
 * Delete a comment
 */
router.delete('/:commentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const commentId = req.params.commentId;
    if (!commentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMMENT_ID', message: 'Comment ID is required' },
      });
    }
    await commentsService.deleteComment(commentId, userId);

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    // MEDIUM FIX: Proper error handling without 'any' type
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';

    if (errorMessage === 'Comment not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '댓글을 찾을 수 없습니다',
        },
      });
    }

    if (errorMessage === 'User does not have permission to delete this comment') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '댓글을 삭제할 권한이 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    });
  }
});

export default router;
