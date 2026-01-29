# Story ${story_id}: ${title}

**Story ID:** ${story_id}
**Epic:** Epic 7 - 팀 협업
**Status:** ready-for-dev
**Last Updated:** 2026-02-02

---

## User Story

**As a** 예비 창업가,
**I want** 팀원들과 협업해서 문서를 작성하고 싶어서,
**So that** 함께 더 나은 결과물을 만들 수 있다.

---

## Acceptance Criteria

### AC1: 팀 생성
**Given** 사용자가 "팀 만들기" 버튼을 클릭했을 때
**Then** 팀 생성 modal이 표시된다:
  - 팀 이름 입력
  - 초대할 팀원 이메일 입력 (쉼표로 구분)
  - "팀 만들기" / "취소" 버튼

**When** 사용자가 팀을 생성하면:
  - `teams` 테이블에 팀 생성
  - `team_members` 테이블에 사용자 추가 (role: "admin")
  - 각 팀원에게 이메일 초대장 발송
  - "팀이 생성되었습니다!" 메시지

### AC2: 권한 시스템
**And** 다음 권한이 구현된다:
  - **Admin**: 모든 권한
  - **Editor**: 문서 생성/편집 가능, 삭제 불가
  - **Viewer**: 문서 조회만 가능

**And** 권한별 접근 제어:
  - Admin: `/api/v1/teams/:teamId/*` 모든 endpoint 접근 가능
  - Editor: `/teams/:teamId/documents/*` POST/PATCH만 가능
  - Viewer: `/teams/:teamId/documents/*` GET만 가능

### AC3: 공유 문서 작업 공간
**Given** 팀원이 팀 대시보드에 접속했을 때
**When** "공유 문서" 탭을 클릭하면
**Then** 팀의 모든 문서가 표시된다:
  - 문서 제목
  - 생성자 이름
  - 마지막 수정 시간
  - "새 문서 만들기" 버튼

### AC4: 댓글 및 피드백
**When** 사용자가 문서를 열면
**Then** 댓글 섹션이 표시된다:
  - 댓글 입력 textarea
  - 댓글 목록 (최신순)
  - "댓글 달기" 버튼

**And** 피드백 요청이 가능하다:
  - "피드백 요청" 버튼 (Editor만)
  - 요청 사유 선택 dropdown (예: "내용 개선", "구조 변경", "오류 수정")

### AC5: 버전 기반 협업 (Polling)
**When** 사용자가 편집 중에 문서를 저장하면
**Then** 30초마다 Polling으로 자동 저장됨:
  - "저장됨" 토스트 메시
  - 다른 팀원이 수정 시 "새 버전이 있습니다. 페이지를 새로고치겠습니까?" 알림

---

## Technical Implementation

### Database Schema

```sql
-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- Shared documents table
CREATE TABLE IF NOT EXISTS shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, document_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_shared_documents_team_id ON shared_documents(team_id);
CREATE INDEX idx_comments_document_id ON comments(document_id);
```

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** High (팀 권한, Polling-based 협업)
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication), Epic 4 (Document Management)

