# Story 4.3: AI 제안 승인/거부 기능

Status: backlog

## Story

As a 캔버스 사용자,
I want AI 제안을 승인/거부하여 노드 내용에 반영,
so that AI의 개인화된 피드백을 빠르게 적용할 수 있다.

## Acceptance Criteria (Summary)

**Suggestion Display:**
- Green border (2px solid #22c55e)
- Formatted content (bullet points, bold)
- 3 action buttons: "적용" / "편집" / "거부"

**Apply Action:**
- Immediate update to node content (1s)
- Optimistic UI update
- Toast: "제안이 적용되었습니다"
- Save to conversationHistory

**Edit Action:**
- Load suggestion into text input
- Allow user modifications
- "수정 내용 적용" button
- Track changes in conversationHistory

**Reject Action:**
- Show rejection reason options
- Options: "너무 일반적" / "맥락에 맞지 않음" / "이미 알고 있음" / "기타"
- Store feedback for AI model improvement

**Batch Suggestions:**
- Support multiple suggestions (max 3)
- Individual action buttons per suggestion
- "모두 적용" button at top
- Sequential application

**Approval Rate Tracking:**
- Track approve/edit/reject counts
- Target: 70% approval rate
- Auto-tune prompts if rate < 70%
- Fallback to expert review if rate remains low

**Offline Support:**
- Disable AI suggestions in offline mode
- Show notification: "오프라인 모드: AI 제안을 사용할 수 없습니다"

## Tasks / Subtasks

- [ ] **Implement Suggestion Card**
  - [ ] Create suggestion card component
  - [ ] Add green border (2px #22c55e)
  - [ ] Format with bullet points and bold text
  - [ ] Add 3 action buttons

- [ ] **Implement Apply Logic**
  - [ ] Update node content immediately (1s)
  - [ ] Use optimistic update pattern
  - [ ] Show success toast
  - [ ] Save to conversationHistory

- [ ] **Implement Edit Mode**
  - [ ] Load suggestion into input field
  - [ ] Enable user modifications
  - [ ] Add "수정 내용 적용" button
  - [ ] Track changes in history

- [ ] **Implement Rejection Tracking**
  - [ ] Display rejection reason options
  - [ ] Store feedback on server
  - [ ] Send to AI model improvement pipeline

- [ ] **Implement Batch Mode**
  - [ ] Support up to 3 suggestions
  - [ ] Add "모두 적용" button
  - [ ] Sequential application logic

- [ ] **Implement Approval Rate Analytics**
  - [ ] Track approve/edit/reject counts
  - [ ] Calculate approval rate
  - [ ] Auto-tune prompts if rate < 70%
  - [ ] Show expert review fallback if needed

## Dev Notes

**API Endpoint:**
```
POST /api/v1/ai/suggestions
Request: {
  nodeId: string;
  context: string;
}
Response: {
  success: true;
  data: { suggestions: Suggestion[] };
}
```

**Performance:**
- Node content update: 1s or less
- Optimistic UI for instant feedback

**Analytics:**
```typescript
interface ApprovalMetrics {
  approved: number;
  edited: number;
  rejected: number;
  rate: number; // Target: 70%
}
```

**Testing:**
- Unit tests for suggestion logic
- Integration tests for apply/edit/reject
- Analytics tracking tests

## References
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-005 노드 상세 보기]
- [Source: epics-new.md#Epic 4 Story 4.3]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/frontend/src/components/sidebar/SuggestionCard.tsx`
- `/Users/donggyu/bm-builder/backend/src/services/aiSuggestion.service.ts`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useSuggestionActions.ts`
