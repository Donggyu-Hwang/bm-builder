# Story 6.2: AI 기반 문서 변환

Status: backlog

## Story

As a 캔버스 사용자,
I want 7개 노드 완료 후 AI 기반 정부지원사업 문서 변환,
so that 린스타트업 캔버스 내용을 바탕으로 정부지원사업 제안서와 IR 자료를 생성할 수 있다.

## Acceptance Criteria (Summary)

**Document Generation Start:**
- Click "전체 내보내기" button
- Show "정부지원사업 제안서를 생성하고 있습니다..." message
- Progress bar: 0% to 100% in 10 seconds
- Show stage-by-stage progress (e.g., "1/7 단계 변환 완료")

**AI Transformation:**
- Send all 7 stage node content to Claude API
- Include conversationHistory (context awareness)
- Apply government proposal template
- Temperature: 0.7, 200K token window
- Generation time: 10 seconds or less

**Stage Mapping:**
- Stage 1 (문제 발굴) → "1. 사업 추진 배경 및 필요성"
- Stage 2 (문제 정의) → "2. 문제 정의 및 해결 과제"
- Stage 3 (고객 개발) → "3. 타겟 고객 및 시장 분석"
- Stage 4 (시장 개발) → "4. 경쟁 현황 및 시장성"
- Stage 5 (솔루션) → "5. 제품/서비스 내용"
- Stage 6 (비즈니스 모델) → "6. 비즈니스 모델 및 수익 구조"
- Stage 7 (IR 자료) → "7. 사업 실행 계획 및 재무 계획"

**Document Display:**
- Full-screen modal
- Markdown rendering
- Left sidebar: Table of contents (7 sections)
- Click section to scroll
- "이 섹션 편집" button for each section

**Download Options:**
- PDF download (primary action)
- DOCX download
- IR deck (PPT) download
- Copy button
- Regenerate button

**PDF Generation:**
- Use markdown-pdf library
- Filename: `government-proposal-{timestamp}.pdf`
- Include: Cover, TOC, 7 sections, Appendix
- Cover: Project name, date
- Download starts within 1 second

**IR Deck Generation:**
- Use officegen library
- Filename: `ir-deck-{timestamp}.pptx`
- 10-15 slides
- Structure: Cover → Problem → Solution → Market → Business Model → Execution → Financial → Contact
- Bullet points from node content
- Download starts within 2 seconds

**Section Editing:**
- Click "이 섹션 편집"
- Show textarea with section text
- Allow user modifications
- "수정본 저장" button
- "원본 복원" option
- Save as separate user-defined version

**Error Handling:**
- Retry button on API failure
- Support ticket link after 3 consecutive failures
- Send error logs to server

**Success Rate Tracking:**
- Target: 85% success rate
- Classify failures (timeout / invalid content / network)
- Auto-tune prompts if rate < 85%
- Collect user satisfaction feedback (star rating)

**Mobile Support:**
- Full-screen progress indicator
- Vertical mode document viewer
- TOC as bottom tabs
- PDF download button in bottom fixed menu

## Tasks / Subtasks

- [ ] **Implement Document Generation UI**
  - [ ] Create full-screen modal
  - [ ] Show progress bar with stage indicators
  - [ ] Display "정부지원사업 제안서를 생성하고 있습니다..."

- [ ] **Implement AI Transformation**
  - [ ] Call Claude API with all node content
  - [ ] Include conversationHistory
  - [ ] Apply government proposal template
  - [ ] Complete within 10 seconds

- [ ] **Implement Stage Mapping**
  - [ ] Map 7 stages to document sections
  - [ ] Transform content per section template
  - [ ] Maintain markdown formatting

- [ ] **Implement Document Display**
  - [ ] Render markdown in full-screen modal
  - [ ] Create TOC sidebar (7 sections)
  - [ ] Implement scroll-to-section
  - [ ] Add "이 섹션 편집" buttons

- [ ] **Implement PDF Generation**
  - [ ] Use markdown-pdf library
  - [ ] Create cover, TOC, sections, appendix
  - [ ] Download within 1 second

- [ ] **Implement IR Deck Generation**
  - [ ] Use officegen library
  - [ ] Create 10-15 slides
  - [ ] Format as bullet points
  - [ ] Download within 2 seconds

- [ ] **Implement Section Editing**
  - [ ] Show textarea for editing
  - [ ] Save modified version
  - [ ] Provide "원본 복원" option

- [ ] **Implement Error Handling**
  - [ ] Detect API failures
  - [ ] Show retry button
  - [ ] Track consecutive failures
  - [ ] Send error logs

- [ ] **Implement Success Rate Analytics**
  - [ ] Track success/failure
  - [ ] Classify failure types
  - [ ] Auto-tune prompts if needed
  - [ ] Collect user feedback

- [ ] **Implement Mobile Responsive Design**
  - [ ] Full-screen progress indicator
  - [ ] Vertical document viewer
  - [ ] Bottom TOC tabs
  - [ ] Fixed download button

## Dev Notes

**API Endpoint:**
```typescript
POST /api/v1/export/full
Request: {
  nodes: Node[];
  conversationHistory: string;
}
Response: {
  success: true;
  data: { document: string; metadata: object };
}
```

**File Generation:**
- PDF: markdown-pdf library
- PPTX: officegen library
- Both must be generated server-side

**Performance:**
- Generation time: 10 seconds or less (NFR-003)
- PDF download: 1 second
- PPTX download: 2 seconds

**Success Rate:**
- Target: 85% or higher
- Monitor and auto-tune prompts

**Testing:**
- Unit tests for transformation logic
- Integration tests for PDF/PPTX generation
- Error handling tests
- Success rate tracking tests

## References
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-008 정부지원사업 내보내기]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-010 AI API 에러 처리]
- [Source: epics-new.md#Epic 6 Story 6.2]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/frontend/src/components/export/DocumentGenerator.tsx`
- `/Users/donggyu/bm-builder/backend/src/services/documentGeneration.service.ts`
- `/Users/donggyu/bm-builder/backend/src/services/pdfGenerator.service.ts`
- `/Users/donggyu/bm-builder/backend/src/services/pptxGenerator.service.ts`
- `/Users/donggyu/bm-builder/backend/src/routes/export.routes.ts`
EOF
echo "Created story 6-2"