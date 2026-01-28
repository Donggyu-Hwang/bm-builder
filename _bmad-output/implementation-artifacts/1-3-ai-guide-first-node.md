# Story 1.3: AI 가이드와 함께 첫 노드 생성

Status: done

## Story

As a 첫 방문자 (온보딩 모드),
I want AI 질문 모드 또는 직접 입력으로 첫 노드 생성,
so that AI의 도움으로 10분 내에 첫 번째 린스타트업 노드를 완성할 수 있다.

## Acceptance Criteria

**Given** 사용자가 "초보자 모드"로 진입했다
**When** 캔버스가 로딩된다
**Then** AI 가이드가 3초 후 자동으로 질문 모드를 시작한다
**And** 질문: "어떤 스타트업 아이디어를 가지고 계신가요? 간단히 설명해주세요"
**And** "3초 후 자동으로 시작됩니다" 카운트다운이 표시된다
**And** "지금 시작하기" / "건너뛰기" 2가지 버튼이 제공된다

**Given** AI 질문 모드가 활성화된다
**When** 사용자가 텍스트를 입력한다
**Then** 입력 필드가 우측 사이드바 형태로 표시된다 (캔버스와 함께 볼 수 있음)
**And** 입력 필드는 자동완성 및 문법 제안을 제공한다
**And** 입력 완료 후 "노드 생성" 버튼이 표시된다

**Given** 사용자가 텍스트를 입력하고 "노드 생성"을 클릭한다
**When** 노드 생성이 완료된다
**Then** 500ms 이내에 새 노드가 캔버스 중앙에 생성된다
**And** 노드 타입은 "문제 발굴"로 자동 지정된다
**And** 노드 내용에 사용자 입력 텍스트가 포함된다
**And** 생성된 노드가 자동으로 선택 상태가 된다

**Given** 사용자가 "건너뛰기"를 클릭한다
**When** AI 질문 모드를 건너뛴다
**Then** 더블클릭으로 노드 생성 모드로 전환된다
**And** 캔버스 중앙에 "더블클릭하여 노드를 생성하세요" 도움말이 표시된다

**Given** 사용자가 더블클릭으로 노드 생성을 선택한다
**When** 캔버스를 더블클릭한다
**Then** 노드 타입 선택 모달이 표시된다
**And** Progress Disclosure가 적용되어 3개 노드 타입만 표시된다
**And** 각 타입에 설명 텍스트가 포함된다

**Given** 사용자가 "경험자 모드"로 진입했다
**When** 캔버스가 로딩된다
**Then** AI 질문 모드가 자동 시작되지 않는다
**And** 바로 더블클릭으로 노드 생성이 가능하다
**And** 우측 상단에 "AI 가이드 시작" 버튼이 표시된다

**Given** 노드가 생성된다
**When** 생성 완료 후
**Then** 생성된 노드 주변에 pulse 애니메이션이 1초간 재생된다
**And** "첫 번째 노드가 생성되었습니다! 이제 내용을 추가해보세요" 토스트가 표시된다

**Given** 오프라인 상태에서 노드를 생성한다
**When** 생성이 완료된다
**Then** LocalStorage에 노드가 저장된다
**And** "오프라인 모드: 노드가 로컬에 저장되었습니다" 알림이 표시된다

## Tasks / Subtasks

- [x] **Implement AI Question Mode**
  - [x] Create `frontend/src/components/onboarding/AIQuestionMode.tsx`
  - [x] Add 3-second countdown timer
  - [x] Display AI question: "어떤 스타트업 아이디어를 가지고 계신가요?"
  - [x] Add "Start Now" / "Skip" buttons
  - [x] Implement sidebar input field (right side, 400px width)

- [x] **Implement Node Creation from AI Input**
  - [x] Create node creation service
  - [x] Handle user text input
  - [x] Set node type to "problem-discovery" (Stage 1) automatically
  - [x] Create node in canvas center within 500ms
  - [x] Auto-select created node

- [x] **Implement Double-Click Node Creation**
  - [x] Add double-click event listener to canvas
  - [x] Create `frontend/src/components/onboarding/NodeTypeSelector.tsx`
  - [x] Apply Progressive Disclosure (show only Stage 1-3)
  - [x] Add description text for each node type
  - [x] Handle node type selection

- [x] **Implement Node Creation Animation**
  - [x] Add pulse animation (1 second) around created node
  - [x] Create `frontend/src/components/onboarding/NodeCreationHint.tsx`
  - [x] Display success message
  - [x] Use CSS animations

- [x] **Implement Experienced Mode Logic**
  - [x] Detect mode from onboarding state
  - [x] Skip auto-start of AI question mode for experienced users
  - [x] Enable immediate double-click node creation
  - [x] Add "Start AI Guide" button in top-right

- [x] **Implement Offline Node Creation**
  - [x] Detect online/offline status (useNetworkStatus)
  - [x] Save node to LocalStorage immediately
  - [x] Display offline notification
  - [x] Queue for sync when online

## Dev Notes

### Architecture Compliance

**Tech Stack Versions:**
- React 19.0 + Vite 7.3.1
- TypeScript 5.3.3 (Strict Mode)
- Redux Toolkit 2.10.1
- Tailwind CSS 3.4.1

**Code Patterns:**
- Service layer for API calls (`services/`)
- Redux slices for node management
- Custom hooks for node creation logic
- Event-driven architecture for canvas interactions

**File Structure:**
```
frontend/src/
├── components/onboarding/
│   ├── AIQuestionMode.tsx
│   └── InputSidebar.tsx
├── components/canvas/
│   ├── NodeTypeModal.tsx
│   └── Node.tsx
├── services/
│   └── nodeCreation.service.ts
├── store/slices/
│   └── nodesSlice.ts
├── hooks/
│   └── useNodeCreation.ts
└── types/
    └── node.ts
```

### Technical Requirements

**Performance Requirements:**
- Node creation time: 500ms or less (NFR-002)
- AI question start: 3 seconds delay
- Animation frame rate: 60fps

**API Endpoints:**
```typescript
// Create Node
POST /api/v1/nodes
Request: {
  type: string; // "problem-discovery" (Stage 1)
  content: string;
  position: { x: number; y: number };
  canvasId: string;
}
Response: {
  success: true;
  data: {
    id: string; // UUID v4
    type: string;
    content: string;
    position: { x: number; y: number };
    stage: number;
    status: "not_started";
    createdAt: timestamp;
  };
}
```

**Node Data Structure:**
```typescript
interface Node {
  id: string; // UUID v4
  type: string; // e.g., "problem-discovery"
  stage: number; // 1-7
  content: string;
  position: { x: number; y: number };
  status: "not_started" | "in_progress" | "completed";
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**LocalStorage Schema:**
```typescript
// Key: 'bm_builder_nodes'
{
  nodes: Node[];
  timestamp: timestamp;
}
```

**Progressive Disclosure (Onboarding Mode):**
- Show only Stage 1-3 node types:
  - Stage 1: 문제 발굴 (빨간색 #ef4444)
  - Stage 2: 문제 정의 (주황색 #f97316)
  - Stage 3: 고객 개발 (노란색 #eab308)

**Animation Requirements:**
- Pulse animation: 1 second duration
- Use CSS keyframes or Framer Motion
- Don't block main thread (use CSS transforms)

**Accessibility Requirements (NFR-010):**
- WCAG 2.1 AA compliance
- Keyboard accessible node creation (Enter key)
- Screen reader announcements for node creation
- Focus management after node creation

**Testing Requirements:**
- Unit tests with Vitest:
  - AIQuestionMode component logic
  - Node creation service
  - LocalStorage read/write
- Integration tests:
  - End-to-end AI question flow
  - Double-click node creation
  - Offline node creation
- Performance tests:
  - Node creation time < 500ms

### References

- [Source: architecture.md#Frontend Architecture]
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-002 노드 생성]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-002 노드 생성 성능]
- [Source: epics-new.md#Epic 1 Story 1.3]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References


### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/onboarding/AIQuestionMode.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/onboarding/InputSidebar.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/canvas/NodeTypeModal.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/canvas/Node.tsx`
- `/Users/donggyu/bm-builder/frontend/src/services/nodeCreation.service.ts`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useNodeCreation.ts`
- `/Users/donggyu/bm-builder/frontend/src/types/node.ts`
