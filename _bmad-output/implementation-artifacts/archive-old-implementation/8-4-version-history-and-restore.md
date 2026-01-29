# Story 8.4: 버전 히스토리 및 복원

**Epic:** Epic 8 - 실시간 협업 및 버전 관리
**Story ID:** 8.4
**Status:** ready-for-dev
**Created:** 2026-01-26
**Last Updated:** 2026-01-26

---

## 📋 User Story

**As a** 팀원,
**I want** 문서의 모든 버전을 보고 이전 버전으로 복원할 수 있길 원해서,
**So that** 실수를 되돌리거나 변경 이력을 추적할 수 있다.

---

## ✅ Acceptance Criteria (BDD Format)

### AC1: Version Snapshot 생성

**Given** 팀원이 문서를 편집할 때
**When** Changes가 save될 때마다
**Then** Version snapshot이 생성된다:
- Trigger: Manual save + Auto-save (5분 간격)
- Storage: `document_versions` table
- Content: Full document state (JSON)
- Metadata: `{ versionNumber, savedBy, savedAt, changeSummary }`

### AC2: Version Retention Policy

**And** Version retention policy이 적용된다:
- Max versions: 100 versions per document
- Cleanup: Old versions auto-deleted (FIFO)
- Important versions: "Star"로 보존 가능
- Archive: 1년 이상 된 versions를 cold storage

### AC3: Version History UI

**When** 사용자가 "버전 히스토리"를 열면
**Then** Version timeline이 표시된다:
- Visual: Vertical timeline
- Each version: Avatar + Name + Timestamp + Summary
- Diff indicator: "12 changes from previous"
- Starred: ⭐ 표시
- Actions: "Compare" | "Restore" | "Star"

### AC4: Version Diff 표시

**And** Version diff가 표시된다:
- Side-by-side: Before vs After
- Highlight: Changed text (red/green)
- Sections: Collapsible sections
- Character-level: Precise diff

### AC5: Version 복원

**Given** 사용자가 버전을 복원할 때
**When** "Restore" 버튼을 클릭하면
**Then** Confirmation modal이 표시된다:
- "Version #12 (Jan 5, 2024)로 복원하시겠습니까?"
- "현재 변경 사항이 덮어씌워집니다."
- "복원" | "취소" 버튼

**And** 복원 시 다음이 발생한다:
- Document content: Restored from version
- New version: Created as #13 "Restored from #12"
- Notification: "Version #12로 복원되었습니다"
- Undo: 가능 (Ctrl/Cmd + Z)

### AC6: Version Star 기능

**Given** Admin이 version을 star할 때
**When** ⭐ star를 클릭하면
**Then** Version이 보존됩니다:
- Starred versions: Auto-cleanup 제외
- Visual: ⭐ 아이콘 표시
- Filter: "Starred만 보기" 옵션

---

## 🏗️ Developer Context

### Version History Architecture

**버전 히스토리는 문서의 모든 변경 사항을 추적하고 복원할 수 있는 기능입니다:**

- **Snapshot-based:** 전체 문서 상태 저장
- **Incremental Storage:** 변경 사항만 저장 (선택 사항)
- **Diff Algorithm:** 두 버전 간 차이점 계산
- **Rollback:** 이전 버전으로 1클릭 복원

### 왜 Snapshot인가?

**장점:**
1. **Simple:** 복잡한 patch 연산 없이 전체 복원
2. **Fast:** Diff 계산 없이 바로 복원
3. **Reliable:** 데이터 무결성 보장
4. **Audit:** Full history 추적 가능

---

## 🛠️ Technical Requirements

### 1. Database: document_versions Table

**Migration:** `backend/src/migrations/XXX_create_document_versions.sql`

```sql
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL, -- Full document state
  saved_by UUID NOT NULL REFERENCES profiles(id),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_summary TEXT,
  is_starred BOOLEAN DEFAULT FALSE,

  INDEX idx_document_versions_document_id (document_id),
  INDEX idx_document_versions_saved_at (saved_at),
  UNIQUE (document_id, version_number)
);

-- Trigger: Auto-increment version_number per document
CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := (
    SELECT COALESCE(MAX(version_number), 0) + 1
    FROM document_versions
    WHERE document_id = NEW.document_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_version
BEFORE INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION increment_version_number();
```

### 2. Backend: Version Service

**File:** `backend/src/services/version.service.ts`

```typescript
import { pool } from '../utils/db';

export class VersionService {
  // Create new version snapshot
  async createVersion(documentId: string, userId: string, content: any, summary: string) {
    const query = `
      INSERT INTO document_versions (document_id, saved_by, content, change_summary)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [documentId, userId, JSON.stringify(content), summary]);

    // Cleanup old versions (keep only 100)
    await this.cleanupOldVersions(documentId);

    return result.rows[0];
  }

  // Get all versions for a document
  async getVersions(documentId: string) {
    const query = `
      SELECT
        dv.*,
        p.full_name as saved_by_name,
        p.avatar_url as saved_by_avatar
      FROM document_versions dv
      JOIN profiles p ON dv.saved_by = p.id
      WHERE dv.document_id = $1
      ORDER BY dv.saved_at DESC
      LIMIT 100
    `;

    const result = await pool.query(query, [documentId]);
    return result.rows;
  }

  // Restore document to specific version
  async restoreVersion(versionId: string, userId: string) {
    const query = `
      WITH version_data AS (
        SELECT document_id, content, version_number
        FROM document_versions
        WHERE id = $1
      )
      UPDATE documents
      SET content = version_data.content,
          updated_at = NOW()
      FROM version_data
      WHERE documents.id = version_data.document_id
      RETURNING documents.id, version_data.version_number as restored_from_version
    `;

    const result = await pool.query(query, [versionId]);

    // Create new version marking the restore
    const { id: documentId, restored_from_version } = result.rows[0];
    await this.createVersion(
      documentId,
      userId,
      result.rows[0].content,
      `Restored from version #${restored_from_version}`
    );

    return result.rows[0];
  }

  // Star/unstar version
  async toggleStar(versionId: string, userId: string) {
    const query = `
      UPDATE document_versions
      SET is_starred = NOT is_starred
      WHERE id = $1 AND saved_by = $2
      RETURNING *
    `;

    const result = await pool.query(query, [versionId, userId]);
    return result.rows[0];
  }

  // Cleanup old versions (keep starred and recent 100)
  private async cleanupOldVersions(documentId: string) {
    const query = `
      DELETE FROM document_versions
      WHERE document_id = $1
        AND id NOT IN (
          SELECT id FROM document_versions
          WHERE document_id = $1
            AND (is_starred = true OR saved_at > NOW() - INTERVAL '1 year')
          ORDER BY saved_at DESC
          LIMIT 100
        )
    `;

    await pool.query(query, [documentId]);
  }
}

export const versionService = new VersionService();
```

### 3. Backend: API Routes

**File:** `backend/src/routes/v1/versions.routes.ts`

```typescript
import { Router } from 'express';
import { versionService } from '../services/version.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/versions/:documentId - Get all versions
router.get('/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const versions = await versionService.getVersions(documentId);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// POST /api/v1/versions/:documentId - Create new version
router.post('/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;
    const { content, summary } = req.body;

    const version = await versionService.createVersion(documentId, userId, content, summary);
    res.json(version);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create version' });
  }
});

// POST /api/v1/versions/:versionId/restore - Restore version
router.post('/:versionId/restore', authMiddleware, async (req, res) => {
  try {
    const { versionId } = req.params;
    const userId = req.user!.id;

    const result = await versionService.restoreVersion(versionId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// PUT /api/v1/versions/:versionId/star - Toggle star
router.put('/:versionId/star', authMiddleware, async (req, res) => {
  try {
    const { versionId } = req.params;
    const userId = req.user!.id;

    const version = await versionService.toggleStar(versionId, userId);
    res.json(version);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle star' });
  }
});

export default router;
```

### 4. Frontend: Version History Component

**File:** `frontend/src/components/documents/VersionHistory.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import { Star, StarBorder, Restore, Compare } from '@mui/icons-material';

interface Version {
  id: string;
  version_number: number;
  saved_at: string;
  saved_by_name: string;
  saved_by_avatar: string;
  change_summary: string;
  is_starred: boolean;
}

interface VersionHistoryProps {
  documentId: string;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ documentId, onClose }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    const response = await fetch(`/api/v1/versions/${documentId}`);
    const data = await response.json();
    setVersions(data);
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('정말 이 버전으로 복원하시겠습니까? 현재 변경 사항이 덮어씌워집니다.')) {
      return;
    }

    await fetch(`/api/v1/versions/${versionId}/restore`, { method: 'POST' });
    alert('버전이 복원되었습니다.');
    window.location.reload();
  };

  const handleToggleStar = async (versionId: string) => {
    await fetch(`/api/v1/versions/${versionId}/star`, { method: 'PUT' });
    fetchVersions();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>버전 히스토리</DialogTitle>
      <DialogContent>
        <List>
          {versions.map((version) => (
            <ListItem key={version.id}>
              <ListItemAvatar>
                <Avatar src={version.saved_by_avatar}>
                  {version.saved_by_name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Version #${version.version_number} - ${version.change_summary}`}
                secondary={`${version.saved_by_name} • ${new Date(version.saved_at).toLocaleString()}`}
              />
              <IconButton onClick={() => handleToggleStar(version.id)}>
                {version.is_starred ? <Star /> : <StarBorder />}
              </IconButton>
              <IconButton onClick={() => handleRestore(version.id)}>
                <Restore />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## 📝 Tasks/Subtasks

### Backend
- [ ] `document_versions` table migration 작성
- [ ] Version service 구현 (생성, 조회, 복원, star)
- [ ] API routes 구현
- [ ] Auto-version trigger on document save
- [ ] Old versions cleanup job

### Frontend
- [ ] Version history dialog component
- [ ] Version timeline UI
- [ ] Restore confirmation modal
- [ ] Star toggle UI
- [ ] Diff viewer (side-by-side comparison)
- [ ] Version history 버튼 추가

### Testing
- [ ] Version creation 테스트
- [ ] Restore flow 테스트
- [ ] Star 기능 테스트
- [ ] Cleanup policy 테스트

---

## 🎯 Success Metrics

- **Version 저장 성공률:** 99.9% 이상
- **Restore 속도:** 1초 이내
- **Storage efficiency:** 100 versions/document 이하 유지

---

## 🔗 Dependencies

- **Prerequisites:** Story 8.3 (실시간 댓글)
- **Related Stories:** Story 8.5 (Conflict Resolution)

---

## 💡 Notes

- Version snapshot은 문서 전체 상태 저장
- Auto-save는 5분 간격, manual save는 즉시
- 복원 후 새 버전이 자동 생성 (복원 이력 추적)
- Star된 버전은 auto-cleanup 제외
