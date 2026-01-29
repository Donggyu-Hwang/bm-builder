# Story 4.1: 문서 저장 및 불러오기

**Story ID:** 4.1
**Epic:** Epic 4 - 문서 관리
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 생성된 문서를 저장하고 나중에 불러올 수 있길 원해서,
**So that** 작업을 중단했다가 다시 시작할 수 있다.

---

## Acceptance Criteria

### AC1: 자동 저장

**Given** 사용자가 문서 생성을 완료했을 때
**When** 문서가 자동으로 저장된다 (Story 3.2)
**Then** `documents` 테이블에 최종 버전이 저장된다:
  - `status: "completed"`
  - `content` (전체 문서)
  - `completed_at` (timestamp)

### AC2: 문서 목록 표시

**When** 사용자가 대시보드에서 "내 문서"를 클릭하면
**Then** 문서 목록이 표시된다

**And** 문서 목록이 다음을 포함한다:
  - Document title
  - Template type badge (정부지원사업, IR 자료)
  - 생성 날짜
  - 미리보기 (첫 200자)
  - "보기" / "편집" / "복제" / "삭제" / "다운로드" 버튼

### AC3: 정렬 기능

**And** 목록이 정렬 가능하다:
  - "최신순" (default)
  - "오래된순"
  - "이름순"

### AC4: 문서 상세보기

**When** 사용자가 "보기"를 클릭하면
**Then** 문서 상세보기 modal이 표시된다
  - 전체 문서 내용
  - 인포그래픽 포함
  - "편집" / "다운로드" / "닫기" 버튼

### AC5: 자동 저장 및 스크롤

**And** 문서가 불러올 때 자동 저장된다:
  - 마지막으로 저장된 위치로 scroll
  - "자동 저장되었습니다" 토스트

### AC6: 검색 기능

**And** 검색 기능이 제공된다:
  - Search bar: "문서 제목으로 검색"
  - Real-time filtering (입력 시 즉시 필터링)
  - 결과 0개: "검색 결과가 없습니다."

---

## Technical Implementation

### Backend Routes

**File:** `backend/src/routes/v1/documents.routes.ts`

```typescript
import { Router } from 'express';
import { documentsService } from '../../services/documents.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/documents - Get user's documents
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sortBy = req.query.sort_by as 'created_at' | 'title' | 'created_at_desc';
    const search = req.query.search as string;

    const documents = await documentsService.getUserDocuments(userId, {
      sortBy,
      search
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: '문서 목록을 가져오는데 실패했습니다'
      }
    });
  }
});

// GET /api/v1/documents/:id - Get document by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await documentsService.getDocument(documentId, userId);

    res.json({
      success: true,
      data: document
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
        code: 'FETCH_FAILED',
        message: '문서를 가져오는데 실패했습니다'
      }
    });
  }
});

export default router;
```

### Frontend Components

**File:** `frontend/src/components/documents/DocumentList.tsx`

```typescript
import { useState, useEffect } from 'react';
import { documentsApi } from '../../api/documentsApi';
import { DocumentViewer } from './DocumentViewer';

export const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'title'>('created_at_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [sortBy, searchQuery]);

  const fetchDocuments = async () => {
    try {
      const data = await documentsApi.getDocuments({ sortBy, search: searchQuery });
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="문서 제목으로 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />

      {/* Sort Options */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as any)}
        className="px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="created_at_desc">최신순</option>
        <option value="created_at_asc">오래된순</option>
        <option value="title">이름순</option>
      </select>

      {/* Document List */}
      {documents.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onView={() => setSelectedDocument(doc)}
        />
      ))}

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};
```

---

## Testing Checklist

- [ ] 문서가 자동으로 저장됨
- [ ] 문서 목록이 올바르게 표시됨
- [ ] 정렬 기능이 작동함
- [ ] 검색이 real-time로 필터링됨
- [ ] 문서 상세보기 modal이 작동함

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication), Epic 3 (AI Generation)
