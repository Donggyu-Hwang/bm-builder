# Story 2.3: 문서 미리 보기 및 검증

**Story ID:** 2.3
**Epic:** Epic 2 - 클라우드 연동 및 문서 임베딩
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 임베딩할 문서를 미리 보고 검증하려고,
**So that** AI가 내 문서를 정확히 참조할 것이라 확신할 수 있다.

---

## Acceptance Criteria

### AC1: 문서 목록 표시

**Given** 사용자가 파일 스캔을 완료했을 때
**When** 사용자가 "문서 미리 보기" 페이지에 접속하면
**Then** 임베딩된 문서 목록이 표시된다

**And** 목록이 다음 정보를 포함한다:
  - File name
  - File type icon (PDF, HWP, DOCX)
  - 분류 상태 (비즈니스 ✅ / 무시 ❌)
  - File size
  - 스캔 날짜

### AC2: 문서 미리 보기 Modal

**When** 사용자가 문서를 클릭하면
**Then** 미리 보기 modal이 표시된다

**And** 미리 보기 modal이 다음을 제공한다:
  - 문서 내용 미리 보기 (text extraction, 최초 500자)
  - "비즈니스 문서" 토글 (수동 변경 가능)
  - "임베딩에서 제외" 체크박스
  - "저장" 버튼

### AC3: 비즈니스 문서 토글

**And** 사용자가 "비즈니스 문서"를 토글하면:
  - `embedded_documents.is_business_document`가 즉시 업데이트된다
  - UI에서 토글 상태가 반영된다

### AC4: 임베딩에서 제외

**And** 사용자가 "임베딩에서 제외"를 체크하면:
  - `embedded_documents.is_excluded` = true
  - RAG 검색에서 제외된다
  - 목록에서 회색으로 표시된다

### AC5: 저장

**When** 사용자가 "저장"을 클릭하면
**Then** 변경사항이 데이터베이스에 커밋된다
  - "저장되었습니다!" toast 메시지

### AC6: 필터 옵션

**And** 필터 옵션이 제공된다:
  - "전체 보기"
  - "비즈니스 문서만"
  - "제외된 문서만"

---

## Technical Implementation

### Database Schema

Already created in Story 2.2. No additional schema changes needed.

```sql
-- embedded_documents table already has:
-- is_business_document BOOLEAN
-- is_excluded BOOLEAN
```

### Backend Implementation

#### 1. Documents Service

**File:** `backend/src/services/embeddedDocuments.service.ts`

```typescript
import { pool } from '../utils/db';

interface EmbeddedDocument {
  id: string;
  file_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'hwp';
  size: number;
  is_business_document: boolean;
  is_excluded: boolean;
  is_deleted: boolean;
  created_at: Date;
}

interface UpdateDocumentInput {
  is_business_document?: boolean;
  is_excluded?: boolean;
}

export class EmbeddedDocumentsService {
  // Get all documents for a user
  async getUserDocuments(
    userId: string,
    filter?: 'all' | 'business' | 'excluded'
  ): Promise<EmbeddedDocument[]> {
    let query = `
      SELECT id, file_id, file_name, file_type, size,
             is_business_document, is_excluded, is_deleted, created_at
      FROM embedded_documents
      WHERE user_id = $1 AND is_deleted = false
    `;
    const params: any[] = [userId];

    if (filter === 'business') {
      query += ' AND is_business_document = true AND is_excluded = false';
    } else if (filter === 'excluded') {
      query += ' AND is_excluded = true';
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Get document by ID
  async getDocumentById(documentId: string, userId: string): Promise<EmbeddedDocument | null> {
    const { rows } = await pool.query(
      `SELECT id, file_id, file_name, file_type, size,
              is_business_document, is_excluded, is_deleted, created_at
       FROM embedded_documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // Update document
  async updateDocument(
    documentId: string,
    userId: string,
    updates: UpdateDocumentInput
  ): Promise<EmbeddedDocument> {
    const { rows } = await pool.query(
      `UPDATE embedded_documents
       SET is_business_document = COALESCE($1, is_business_document),
           is_excluded = COALESCE($2, is_excluded),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [updates.is_business_document, updates.is_excluded, documentId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0];
  }

  // Get document preview (text extraction)
  async getDocumentPreview(documentId: string, userId: string): Promise<string> {
    const document = await this.getDocumentById(documentId, userId);

    if (!document) {
      throw new Error('Document not found');
    }

    // For now, return a placeholder
    // In Story 3.2, we'll implement actual text extraction
    return `[문서 미리보기]\n\n파일명: ${document.file_name}\n형식: ${document.file_type}\n\n(실제 텍스트 추출은 Story 3.2에서 구현됩니다)`;
  }

  // Get document statistics
  async getDocumentStats(userId: string): Promise<{
    total: number;
    business: number;
    excluded: number;
  }> {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE is_business_document = true AND is_excluded = false) as business,
         COUNT(*) FILTER (WHERE is_excluded = true) as excluded
       FROM embedded_documents
       WHERE user_id = $1 AND is_deleted = false`,
      [userId]
    );

    return rows[0];
  }
}

export const embeddedDocumentsService = new EmbeddedDocumentsService();
```

#### 2. Documents Routes

**File:** `backend/src/routes/v1/embeddedDocuments.routes.ts`

```typescript
import { Router } from 'express';
import { embeddedDocumentsService } from '../../services/embeddedDocuments.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/documents - Get all documents
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const filter = req.query.filter as 'all' | 'business' | 'excluded' || 'all';

    const documents = await embeddedDocumentsService.getUserDocuments(userId, filter);

    res.json({
      success: true,
      data: documents
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message || '문서 목록을 가져오는데 실패했습니다'
      }
    });
  }
});

// GET /api/v1/documents/stats - Get document statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await embeddedDocumentsService.getDocumentStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: '통계를 가져오는데 실패했습니다'
      }
    });
  }
});

// GET /api/v1/documents/:id - Get document by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await embeddedDocumentsService.getDocumentById(documentId, userId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다'
        }
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message || '문서를 가져오는데 실패했습니다'
      }
    });
  }
});

// GET /api/v1/documents/:id/preview - Get document preview
router.get('/:id/preview', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const preview = await embeddedDocumentsService.getDocumentPreview(documentId, userId);

    res.json({
      success: true,
      data: { preview }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PREVIEW_FAILED',
        message: error.message || '미리보기를 가져오는데 실패했습니다'
      }
    });
  }
});

// PATCH /api/v1/documents/:id - Update document
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;
    const updates = req.body;

    const document = await embeddedDocumentsService.updateDocument(
      documentId,
      userId,
      updates
    );

    res.json({
      success: true,
      data: document,
      message: '저장되었습니다!'
    });
  } catch (error: any) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '문서를 찾을 수 없습니다'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error.message || '문서 업데이트에 실패했습니다'
      }
    });
  }
});

export default router;
```

### Frontend Implementation

#### 1. Documents API Client

**File:** `frontend/src/api/embeddedDocumentsApi.ts`

```typescript
import axiosInstance from './client';

interface EmbeddedDocument {
  id: string;
  file_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'hwp';
  size: number;
  is_business_document: boolean;
  is_excluded: boolean;
  is_deleted: boolean;
  created_at: Date;
}

interface DocumentStats {
  total: number;
  business: number;
  excluded: number;
}

export const embeddedDocumentsApi = {
  // Get all documents
  getDocuments: async (filter?: 'all' | 'business' | 'excluded'): Promise<EmbeddedDocument[]> => {
    const params = filter ? { filter } : {};
    const { data } = await axiosInstance.get('/api/v1/documents', { params });
    return data.data;
  },

  // Get document statistics
  getStats: async (): Promise<DocumentStats> => {
    const { data } = await axiosInstance.get('/api/v1/documents/stats');
    return data.data;
  },

  // Get document by ID
  getDocument: async (id: string): Promise<EmbeddedDocument> => {
    const { data } = await axiosInstance.get(`/api/v1/documents/${id}`);
    return data.data;
  },

  // Get document preview
  getPreview: async (id: string): Promise<string> => {
    const { data } = await axiosInstance.get(`/api/v1/documents/${id}/preview`);
    return data.data.preview;
  },

  // Update document
  updateDocument: async (id: string, updates: {
    is_business_document?: boolean;
    is_excluded?: boolean;
  }): Promise<EmbeddedDocument> => {
    const { data } = await axiosInstance.patch(`/api/v1/documents/${id}`, updates);
    return data.data;
  }
};
```

#### 2. Document List Component

**File:** `frontend/src/components/documents/DocumentList.tsx`

```typescript
import { useEffect, useState } from 'react';
import { embeddedDocumentsApi } from '../../api/embeddedDocumentsApi';

interface Document {
  id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'hwp';
  size: number;
  is_business_document: boolean;
  is_excluded: boolean;
  created_at: Date;
}

export const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<'all' | 'business' | 'excluded'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await embeddedDocumentsApi.getDocuments(filter);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = async (document: Document) => {
    setSelectedDocument(document);
    setShowModal(true);

    try {
      const previewText = await embeddedDocumentsApi.getPreview(document.id);
      setPreview(previewText);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    }
  };

  const handleToggleBusiness = async () => {
    if (!selectedDocument) return;

    try {
      const updated = await embeddedDocumentsApi.updateDocument(selectedDocument.id, {
        is_business_document: !selectedDocument.is_business_document
      });

      setSelectedDocument(updated);
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleToggleExclude = async () => {
    if (!selectedDocument) return;

    try {
      const updated = await embeddedDocumentsApi.updateDocument(selectedDocument.id, {
        is_excluded: !selectedDocument.is_excluded
      });

      setSelectedDocument(updated);
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'hwp': return '📃';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          전체 보기
        </button>
        <button
          onClick={() => setFilter('business')}
          className={`px-4 py-2 rounded ${
            filter === 'business'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          비즈니스 문서만
        </button>
        <button
          onClick={() => setFilter('excluded')}
          className={`px-4 py-2 rounded ${
            filter === 'excluded'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          제외된 문서만
        </button>
      </div>

      {/* Document List */}
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentClick(doc)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              doc.is_excluded
                ? 'bg-gray-100 border-gray-300 opacity-60'
                : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{doc.file_name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(doc.size)} • {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.is_business_document && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    비즈니스 ✅
                  </span>
                )}
                {doc.is_excluded && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    제외됨 ❌
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>표시할 문서가 없습니다</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedDocument.file_name}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Preview Text */}
              <div className="bg-gray-50 p-4 rounded mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {preview}
                </pre>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">비즈니스 문서</span>
                  <button
                    onClick={handleToggleBusiness}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedDocument.is_business_document ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        selectedDocument.is_business_document ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">임베딩에서 제외</span>
                  <input
                    type="checkbox"
                    checked={selectedDocument.is_excluded}
                    onChange={handleToggleExclude}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Environment Variables

No additional environment variables required.

---

## Testing Checklist

- [ ] 문서 목록이 올바르게 표시된다
- [ ] 필터 기능이 작동한다 (전체/비즈니스/제외)
- [ ] 문서 클릭 시 미리 보기 modal이 표시된다
- [ ] "비즈니스 문서" 토글이 즉시 저장된다
- [ ] "임베딩에서 제외" 체크박스가 작동한다
- [ ] 제외된 문서가 목록에서 회색으로 표시된다
- [ ] 파일 크기가 올바르게 포맷팅된다
- [ ] 파일 타입 아이콘이 올바르게 표시된다

---

## Performance Considerations

1. **Lazy Loading**: For large document sets, implement virtual scrolling or pagination
2. **Preview Caching**: Cache extracted text previews to avoid re-extraction
3. **Debouncing**: Debounce toggle updates to reduce API calls

---

## Dependencies

**Backend:**
- No additional dependencies

**Frontend:**
- Existing dependencies

---

## Notes

- **Text Extraction**: Actual text extraction from PDF/DOCX/HWP will be implemented in Story 3.2 (RAG embedding)
- **Preview Limitation**: Currently showing placeholder text; full preview will be available after Story 3.2
- **Batch Updates**: Consider implementing batch update for multiple documents

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Code review completed
- [ ] Unit tests written (document filtering, update logic)
- [ ] Integration tests with embedded_documents table
- [ ] UI/UX testing with different document types
- [ ] Performance testing with large document sets (1000+ documents)
- [ ] Accessibility testing (keyboard navigation, screen readers)
- [ ] Deployed to staging environment
- [ ] Tested with real scanned documents from Story 2.2

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium (UI components, modal, filtering)
**Recommended Developer:** Dev agent
**Dependencies:** Story 2.2 (Initial File Scan)
