# Story 6.1: 3개 노드 완료 시 부분 내보내기 버튼 표시

Status: done

## Story

As a 캔버스 사용자,
I want 3개 이상 노드 완료 시 부분 내보내기 버튼 표시,
so that 진행 중인 작업을 초안으로 내보내어 피드백을 받을 수 있다.

## Acceptance Criteria (Summary)

**Button Display Logic:**
- Hide when completed nodes < 3
- Show in header right when completed nodes >= 3
- Blue button (#3b82f6), document icon 📄
- Text: "부분 내보내기"
- Hover tooltip: "완성된 노드를 기반으로 초안 생성"
- Pulse animation (2 seconds) on first display

**Partial Export Flow:**
- Click triggers "부분 초안을 생성하고 있습니다..." message
- Progress bar: 0% to 100% in 5 seconds
- Collect completed node content
- Mark incomplete nodes as "⚠️ 미완성: [노드명]"

**AI Generation:**
- Send completed nodes to Claude API
- Include incomplete node list
- Generate up to 3 completion recommendations
- Generation time: 5 seconds or less
- Temperature: 0.5 (consistency)

**Result Display:**
- Show draft in right sidebar
- Markdown format
- Organize by completed stages
- Mark incomplete stages with "⚠️ 미완성"
- Show recommendations at bottom

**Incomplete Node Handling:**
- Format: "⚠️ 미완성: [Stage] [노드명]"
- Show up to 3 recommendations
- Format: "다음 단계: [Stage] 완성을 추천합니다"

**Download Options:**
- PDF download button
- DOCX download button
- Copy button
- Regenerate button

**Offline Support:**
- Disable button in offline mode
- Show "오프라인 모드: 부분 내보내기를 사용할 수 없습니다" toast

**Transition to Full Export:**
- Change to "전체 내보내기" when 7/7 nodes completed
- Change color to green (#22c55e)
- Show "모든 단계 완성! 정부지원사업 제안서 생성" text

## Tasks / Subtasks

- [ ] **Implement Button Display Logic**
  - [ ] Track completed node count
  - [ ] Show button when count >= 3
  - [ ] Position in header right
  - [ ] Style: blue (#3b82f6), icon 📄
  - [ ] Add pulse animation on first display

- [ ] **Implement Export Flow**
  - [ ] Show progress message
  - [ ] Animate progress bar (5 seconds)
  - [ ] Collect completed node data
  - [ ] Mark incomplete nodes

- [ ] **Implement AI Draft Generation**
  - [ ] Call Claude API with node data
  - [ ] Include incomplete node list
  - [ ] Generate 3 recommendations
  - [ ] Complete within 5 seconds

- [ ] **Implement Result Display**
  - [ ] Render markdown in sidebar
  - [ ] Organize by stages
  - [ ] Mark incomplete stages
  - [ ] Show recommendations

- [ ] **Implement Download Options**
  - [ ] PDF generation (markdown-pdf)
  - [ ] DOCX generation
  - [ ] Copy to clipboard
  - [ ] Regenerate option

- [ ] **Implement Offline Detection**
  - [ ] Disable button when offline
  - [ ] Show offline notification

- [ ] **Implement Full Export Transition**
  - [ ] Detect 7/7 completion
  - [ ] Change button text and color
  - [ ] Show completion message

## Dev Notes

**API Endpoint:**
```typescript
POST /api/v1/export/partial
Request: {
  completedNodes: Node[];
  incompleteNodes: Node[];
}
Response: {
  success: true;
  data: { draft: string; recommendations: string[] };
}
```

**File Naming:**
- PDF: `lean-startup-canvas-partial-{timestamp}.pdf`

**Performance:**
- Generation time: 5 seconds or less
- Progress bar animation: smooth 60fps

**Testing:**
- Unit tests for generation logic
- Integration tests for download
- PDF/DOCX format validation

## References
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-009 부분 진행 상태 내보내기]
- [Source: epics-new.md#Epic 6 Story 6.1]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/frontend/src/components/header/PartialExportButton.tsx`
- `/Users/donggyu/bm-builder/backend/src/services/export.service.ts`
- `/Users/donggyu/bm-builder/backend/src/routes/export.routes.ts`
EOF
echo "Created story 6-1"