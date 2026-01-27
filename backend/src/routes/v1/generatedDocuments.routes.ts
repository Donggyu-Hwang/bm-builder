/**
 * Generated Documents Routes
 * API endpoints for AI-generated documents
 * Note: Using /api/v1/generated-documents to avoid conflict with embedded documents
 */

import { Router, Response, Request } from 'express';
import { documentsService } from '../../services/documents.service';
import { pdfGenerationService } from '../../services/pdfGeneration.service';
import { pptxGenerationService } from '../../services/pptxGeneration.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/generated-documents
 * Get all documents for authenticated user with optional filtering and sorting
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required',
        },
      });
    }
    const userId = user.id;

    const sortBy = req.query.sort_by as
      | 'created_at'
      | 'title'
      | 'created_at_desc'
      | 'created_at_asc'
      | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await documentsService.getUserDocuments(userId, {
      sortBy,
      search,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: '문서 목록을 가져오는데 실패했습니다',
      },
    });
  }
});

/**
 * GET /api/v1/generated-documents/:id
 * Get document by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const document = await documentsService.getDocument(documentId, userId);

    res.json({
      success: true,
      data: document,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서를 가져오는데 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/generated-documents/:id/preview
 * Get document preview (first 200 characters)
 */
router.get('/:id/preview', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const preview = await documentsService.getDocumentPreview(documentId, userId);

    res.json({
      success: true,
      data: preview,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : '미리보기를 가져오는데 실패했습니다';
    const statusCode = errorMessage === 'Document not found' ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'NOT_FOUND' : 'PREVIEW_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/generated-documents
 * Create a new document
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

    const { title, content, template_type, status } = req.body;

    if (!title || !template_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title and template_type are required',
        },
      });
    }

    const document = await documentsService.createDocument(userId, {
      title,
      content,
      template_type,
      status,
    });

    res.status(201).json({
      success: true,
      data: document,
      message: '문서가 생성되었습니다',
    });
  } catch (error) {
    console.error('Failed to create document:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: '문서 생성에 실패했습니다',
      },
    });
  }
});

/**
 * PUT /api/v1/generated-documents/:id
 * Update document
 */
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const updates = req.body;

    const document = await documentsService.updateDocument(documentId, userId, updates);

    res.json({
      success: true,
      data: document,
      message: '문서가 저장되었습니다',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서 업데이트에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * DELETE /api/v1/generated-documents/:id
 * Delete document
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    await documentsService.deleteDocument(documentId, userId);

    res.json({
      success: true,
      message: '문서가 삭제되었습니다',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서 삭제에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * POST /api/v1/generated-documents/:id/duplicate
 * Duplicate document
 */
router.post('/:id/duplicate', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const duplicated = await documentsService.duplicateDocument(documentId, userId);

    res.status(201).json({
      success: true,
      data: duplicated,
      message: '문서가 복제되었습니다',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '문서 복제에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DUPLICATE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/generated-documents/:id/download/pdf
 * Download document as PDF
 */
router.get('/:id/download/pdf', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }

    // Get document to generate filename
    const document = await documentsService.getDocument(documentId, userId);
    const filename = pdfGenerationService.getPDFFileName(document.title);

    // Generate PDF
    const pdfBuffer = await pdfGenerationService.generatePDF(documentId, userId);

    // Set headers and send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(pdfBuffer);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'PDF 생성에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'PDF_GENERATION_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/generated-documents/:id/download/ppt
 * Download pitch deck document as PPTX
 */
router.get('/:id/download/ppt', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }

    // Get document to check if it's a pitch deck and generate filename
    const document = await documentsService.getDocument(documentId, userId);

    if (document.template_type !== 'pitch_deck') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_A_PITCH_DECK',
          message: '이 문서는 피칭 데크가 아닙니다',
        },
      });
    }

    const filename = pptxGenerationService.getPPTXFileName(document.title);

    // Generate PPTX
    const pptxBuffer = await pptxGenerationService.generatePPTX(documentId, userId);

    // Set headers and send file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(pptxBuffer);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'PPTX 생성에 실패했습니다';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'PPTX_GENERATION_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * GET /api/v1/generated-documents/team/:teamId
 * Get all documents for a team
 */
router.get('/team/:teamId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TEAM_ID', message: 'Team ID is required' },
      });
    }
    const sortBy = req.query.sort_by as
      | 'created_at'
      | 'title'
      | 'created_at_desc'
      | 'created_at_asc'
      | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await documentsService.getTeamDocuments(teamId, userId, {
      sortBy,
      search,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Failed to fetch team documents:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team documents';

    if (errorMessage === 'User is not a member of this team') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '이 팀의 문서에 접근할 권한이 없습니다',
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
 * PATCH /api/v1/generated-documents/:id/sharing
 * Update document sharing settings
 */
router.patch('/:id/sharing', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const { team_id, sharing_access, sharing_permission, link_password, link_expires_at } =
      req.body;

    const document = await documentsService.updateDocumentSharing(documentId, userId, {
      team_id,
      sharing_access,
      sharing_permission,
      link_password,
      link_expires_at,
    });

    res.json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    console.error('Failed to update sharing settings:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update sharing settings';

    if (errorMessage === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다',
        },
      });
    }

    if (errorMessage === 'Only document owner can update sharing settings') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '문서 소유자만 공유 설정을 변경할 수 있습니다',
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
 * GET /api/v1/generated-documents/share/:link
 * Get document by share link
 */
router.get('/share/:link', async (req: Request, res: Response) => {
  try {
    const shareLink = req.params.link;
    if (!shareLink) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LINK',
          message: 'Share link is required',
        },
      });
    }
    const document = await documentsService.getDocumentByShareLink(shareLink);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없거나 만료되었습니다',
        },
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    console.error('Failed to fetch shared document:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shared document';

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
 * GET /api/v1/generated-documents/:id/changes
 * Check for document changes since a given timestamp (for polling)
 */
router.get('/:id/changes', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const userId = user.id;

    const documentId = req.params.id;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Document ID is required' },
      });
    }
    const since = req.query.since as string;

    if (!since) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'since 파라미터가 필요합니다',
        },
      });
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '잘못된 날짜 형식입니다',
        },
      });
    }

    const changes = await documentsService.getDocumentChanges(documentId, userId, sinceDate);

    // Return 304 if no changes
    if (!changes.hasChanges) {
      return res.status(304).end();
    }

    res.json({
      success: true,
      data: changes,
    });
  } catch (error: any) {
    console.error('Failed to check document changes:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to check document changes';

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

export default router;
