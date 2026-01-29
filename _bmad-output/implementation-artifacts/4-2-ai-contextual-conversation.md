# Story 4.2: AI 맥락 인식 대화 시스템

Status: backlog

## Story

As a 캔버스 사용자,
I want AI Co-Founder와 맥락 인식 대화로 노드 내용 개발,
so that 이전 노드 내용을 기반으로 한 연속적 질문과 개인화된 피드백을 받을 수 있다.

## Acceptance Criteria (Summary)

**AI Greeting & Context Loading:**
- Display greeting: "안녕하세요! 이 노드의 내용을 함께 develop 해보아요"
- Load conversationHistory from all previous nodes (title + body)

**Contextual Question Generation:**
- Generate questions based on current node Stage and context
- Reference previous node content (context awareness)
- Use Lean Startup methodology (no technical jargon)
- Response start: 2s, completion: 5s (NFR-003)

**Claude API Integration:**
- 200K token context window
- conversationHistory as system message
- Current node content as user message
- Temperature: 0.7, max_tokens: 500

**Progress Indication:**
- "AI가 내용을 생성하고 있습니다..." indicator
- Animated progress indicator (3 dots)

**Response Display:**
- Chat bubble format (blue background #3b82f6)
- Markdown support (bold, list, etc.)
- Feedback buttons (👍 / 👎)

**Error Handling:**
- Retry button on API failure
- Support ticket link after 3 consecutive failures
- "Offline mode" notification

**Segmented Questioning:**
- One question at a time (not multiple)
- User response before next question
- "다음 질문으로 넘어가시겠습니까?" confirmation

## Tasks / Subtasks

- [ ] **Implement AI Chat Interface**
  - [ ] Create chat bubble components
  - [ ] Add markdown rendering support
  - [ ] Implement feedback buttons (👍 / 👎)
  - [ ] Create feedback input form

- [ ] **Implement Claude API Integration**
  - [ ] Create `backend/src/services/claude.service.ts`
  - [ ] Use 200K token context window
  - [ ] Set temperature: 0.7, max_tokens: 500
  - [ ] Implement streaming response (SSE)

- [ ] **Implement Context Loading**
  - [ ] Load conversationHistory from all previous nodes
  - [ ] Format as system message
  - [ ] Include current node content as user message

- [ ] **Implement Progress Indication**
  - [ ] Show "AI가 내용을 생성하고 있습니다..."
  - [ ] Animated dots (3 dots cycling)

- [ ] **Implement Error Handling**
  - [ ] Detect API failures
  - [ ] Show retry button
  - [ ] Track consecutive failures
  - [ ] Display support ticket link after 3 failures

- [ ] **Implement Segmented Questioning**
  - [ ] Generate one question at a time
  - [ ] Wait for user response
  - [ ] Confirm before next question

## Dev Notes

**API Endpoint:**
```
POST /api/v1/ai/chat
Request: {
  conversationHistory: string;
  currentNodeContent: string;
  stage: number;
}
Response: {
  success: true;
  data: { response: string };
}
```

**Performance:**
- Short questions (< 100 chars): Start 2s, complete 5s
- Long questions (> 100 chars): Start 3s, complete 10s

**Testing:**
- Unit tests for API integration
- Integration tests for chat flow
- Error handling tests

## References
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-003 AI 응답 속도]
- [Source: epics-new.md#Epic 4 Story 4.2]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/backend/src/services/claude.service.ts`
- `/Users/donggyu/bm-builder/frontend/src/components/sidebar/AIChatTab.tsx`
