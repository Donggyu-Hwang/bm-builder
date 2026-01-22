# Story 4.2: 문서 복제 및 삭제

**Story ID:** 4.2
**Epic:** Epic 4 - 문서 관리
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 문서를 복제하고 삭제할 수 있길 원해서,
**So that** 변형을 실험하고 불필요한 문서를 정리할 수 있다.

---

## Acceptance Criteria

### AC1: 복제 Modal

**Given** 사용자가 문서 목록에 있을 때
**When** 사용자가 "복제" 버튼을 클릭하면
**Then** 문서 복제 modal이 표시된다:
  - "제목: [원본 제목] (복사)"
  - Title 입력 field (editable)
  - "복제" / "취소" 버튼

### AC2: 복제 실행

**When** 사용자가 "복제"를 클릭하면
**Then** 새 문서가 `documents` 테이블에 생성된다:
  - `title`: 사용자가 입력한 제목 (default: "[원본] (복사)")
  - `content`: 원본과 동일
  - `original_document_id` (UUID, foreign key to 원본)
  - `is_copy: true`
  - `status: "completed"`

**And** 성공 메시지: "문서가 복제되었습니다."
**And** 대시보드가 새 문서로 refresh된다

### AC3: 삭제 확인 Modal

**Given** 사용자가 문서를 삭제하려고 할 때
**When** 사용자가 "삭제" 버튼을 클릭하면
**Then** 확인 modal이 표시된다:
  - "정말 이 문서를 삭제하시겠습니까?"
  - "삭제된 문서는 복구할 수 없습니다."
  - "취소" / "삭제" 버튼

### AC4: Soft Delete 실행

**When** 사용자가 "삭제"를 확인하면
**Then** soft delete가 수행된다:
  - `documents.is_deleted: true`로 업데이트
  - `deleted_at` timestamp 설정
  - 목록에서 숨겨진다

### AC5: 영구 삭제 (Background Job)

**And** 삭제된 문서는 30일 후 영구 삭제된다:
  - Background job: 매일 자정 0시에 30일 전 문서 삭제
  - `WHERE is_deleted = true AND deleted_at < NOW() - INTERVAL '30 days'`

### AC6: 에러 처리

**When** 사용자가 "삭제"를 실행할 때 오류가 발생하면
**Then** "삭제에 실패했습니다. 다시 시도해주세요." 에러 메시지

---

## Technical Implementation

### Database Schema

```sql
-- Update documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_copy BOOLEAN DEFAULT FALSE;

-- Create index for soft delete queries
CREATE INDEX idx_documents_is_deleted ON documents(is_deleted);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);
```

### Backend Service

**File:** `backend/src/services/documentManagement.service.ts`

```typescript
import { pool } from '../utils/db';

export class DocumentManagementService {
  async duplicateDocument(documentId: string, userId: string, newTitle?: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get original document
      const { rows: [original] } = await client.query(
        'SELECT * FROM documents WHERE id = $1 AND user_id = $2 AND is_deleted = false',
        [documentId, userId]
      );

      if (!original) {
        throw new Error('Document not found');
      }

      // Create duplicate
      const title = newTitle || `${original.title} (복사)`;
      const { rows: [duplicate] } = await client.query(
        `INSERT INTO documents (
          user_id, title, content, template_type, 
          original_document_id, is_copy, status
        ) VALUES ($1, $2, $3, $4, $5, true, 'completed')
        RETURNING *`,
        [userId, title, original.content, original.template_type, documentId]
      );

      await client.query('COMMIT');
      return duplicate;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async softDeleteDocument(documentId: string, userId: string) {
    const { rows } = await pool.query(
      `UPDATE documents
       SET is_deleted = true, deleted_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [documentId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0];
  }

  async permanentlyDeleteOldDocuments(): Promise<number> {
    const result = await pool.query(
      `DELETE FROM documents
       WHERE is_deleted = true
         AND deleted_at < NOW() - INTERVAL '30 days'
       RETURNING id`
    );

    return result.rowCount;
  }
}

export const documentManagementService = new DocumentManagementService();
```

---

## Testing Checklist

- [ ] 복제 modal이 올바르게 표시됨
- [ ] 복제 시 원본과 동일한 내용이 복사됨
- [ ] 삭제 확인 modal이 표시됨
- [ ] Soft delete가 작동함
- [ ] 삭제된 문서가 목록에서 숨겨짐
- [ ] 30일 후 영구 삭제 배치 작업

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium
**Recommended Developer:** Dev agent
**Dependencies:** Story 4.1 (Document Save and Load)
