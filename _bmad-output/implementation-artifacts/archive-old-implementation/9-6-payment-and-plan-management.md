# Story ${story_id}: ${title}

**Story ID:** ${story_id}
**Epic:** Epic 9 - 대시보드 및 관리자 기능
**Status:** ready-for-dev
**Last Updated:** 2026-02-02

---

## User Story

**As a** [사용자 유형],
**I want** [기능]을 관리하고 싶어서,
**So that** [목적].

---

## Acceptance Criteria

### AC1: 대시보드 표시
**Given** 사용자가 로그인했을 때
**When** 대시보드 페이지에 접속하면
**Then** [개인/팀 관리자] 대시보드가 표시된다

### AC2: 데이터 시각화
**And** 다음이 표시된다:
  - [구체적인 데이터 시각화 내용]

### AC3: 관리 기능
**And** 관리자는 다음을 할 수 있다:
  - [관리자 전용 기능]

---

## Technical Implementation

### Database Schema

\`\`\`sql
-- [테이블 정의]
\`\`\`

### Backend Routes

\`\`\`typescript
// [API 엔드포인트 구현]
\`\`\`

### Frontend Components

\`\`\`typescript
// [대시보드 UI 컴포넌트]
\`\`\`

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication), [의존 에픽]
