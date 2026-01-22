# Story 4.4: 문서 편집

**Story ID:** 4.4
**Epic:** Epic 4 - 문서 관리
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 생성된 문서를 편집할 수 있길 원해서,
**So that** AI가 생성한 초안을 수정할 수 있다.

---

## Acceptance Criteria

### AC1: 편집 페이지 접근

**Given** 사용자가 문서 상세보기 modal에 있을 때
**When** 사용자가 "편집" 버튼을 클릭하면
**Then** 문서 편집 페이지로 이동한다

### AC2: WYSIWYG 에디터

**And** 편집 페이지가 다음을 제공한다:
  - WYSIWYG 에디터 (Tiptap 또는 Quill)
  - Toolbar: bold, italic, underline, heading, list, image
  - 문서 내용 editable
  - "저장" / "취소" / "미리보기" 버튼

### AC3: 자동 저장

**When** 사용자가 에디터에서 내용을 수정하면
**Then** 자동 저장이 수행된다:
  - 30초마다 auto-save
  - "저장 중..." / "저장됨" 토스트
  - `documents.updated_at` 업데이트

### AC4: 인포그래픽 편집

**And** 사용자가 인포그래픽을 편집할 수 있다:
  - 이미지를 클릭 → "교체" / "삭제" / "재생성" 옵션
  - 새 이미지 업로드 가능
  - 캡션 수정 가능

### AC5: 최종 저장

**When** 사용자가 "저장"을 클릭하면
**Then** 최종 저장이 수행된다:
  - `documents.content` 업데이트
  - `documents.is_edited: true`
  - "저장되었습니다!" 성공 메시지
  - 문서 상세보기 modal로 redirect

### AC6: 버전 히스토리

**And** 버전 히스토리가 관리된다:
  - `document_versions` 테이블:
    - `document_id` (UUID)
    - `version_number` (integer)
    - `content` (text)
    - `created_at` (timestamp)
  - 최대 10개 버전 저장 (FIFO)
  - "이전 버전 보기" 기능

---

## Technical Implementation

### Database Schema

```sql
-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, version_number)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);

-- Update documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
```

### Backend Service

**File:** `backend/src/services/documentEdit.service.ts`

```typescript
import { pool } from '../utils/db';

export class DocumentEditService {
  async updateDocument(documentId: string, userId: string, content: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current version
      const { rows: [currentDoc] } = await client.query(
        'SELECT version_number FROM document_versions WHERE document_id = $1 ORDER BY version_number DESC LIMIT 1',
        [documentId]
      );

      const newVersion = (currentDoc?.version_number || 0) + 1;

      // Save version history (max 10 versions)
      await client.query(`
        DELETE FROM document_versions
        WHERE document_id = $1
          AND version_number <= (
            SELECT version_number FROM document_versions
            WHERE document_id = $1
            ORDER BY version_number DESC
            OFFSET 9 LIMIT 1
          )
      `, [documentId]);

      await client.query(
        `INSERT INTO document_versions (document_id, version_number, content)
         VALUES ($1, $2, $3)`,
        [documentId, newVersion, content]
      );

      // Update document
      const { rows: [updatedDoc] } = await client.query(
        `UPDATE documents
         SET content = $1, is_edited = true, updated_at = NOW()
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [content, documentId, userId]
      );

      await client.query('COMMIT');
      return updatedDoc;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getVersionHistory(documentId: string, userId: string) {
    const { rows } = await pool.query(
      `SELECT dv.*, d.title
       FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE dv.document_id = $1 AND d.user_id = $2
       ORDER BY dv.version_number DESC`,
      [documentId, userId]
    );

    return rows;
  }
}

export const documentEditService = new DocumentEditService();
```

---

## Testing Checklist

- [ ] 편집 페이지로 이동 가능
- [ ] WYSIWYG 에디터가 작동함
- [ ] 30초마다 자동 저장됨
- [ ] 인포그래픽 편집 가능
- [ ] 버전 히스토리가 저장됨
- [ ] 최대 10개 버전만 저장됨 (FIFO)

---

## Frontend Library Recommendation

**Tiptap** (Recommended):
- Modern, extensible rich-text editor
- TypeScript support
- Collaborative editing ready (for Epic 8)
- React integration

**Installation:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
```

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** High (WYSIWYG editor, version history)
**Recommended Developer:** Dev agent
**Dependencies:** Story 4.1 (Document Save and Load)
