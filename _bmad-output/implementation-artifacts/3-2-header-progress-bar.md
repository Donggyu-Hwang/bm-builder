# Story 3.2: 헤더 진행률 바 및 "완료 X/7" 표시

Status: done

## Story

As a 캔버스 사용자,
I want 헤더에 전체 진행률 표시,
so that 7단계 린스타트업 여정의 진행 상황을 한눈에 파악할 수 있다.

## Acceptance Criteria

**Given** 사용자가 캔버스에 진입한다
**When** 화면이 로딩된다
**Then** 헤더 중앙에 "완료 X/7" 텍스트가 표시된다
**And** X는 완료된 노드 수이다
**And** 텍스트는 굵은 폰트(font-weight: 700)으로 표시된다
**And** 텍스트 색상은 기본 검은색이다

**Given** 진행률 바가 표시된다
**When** 헤더를 확인한다
**Then** "완료 X/7" 텍스트 아래에 진행률 바가 표시된다
**And** 진행률 바는 너비 200px, 높이 8px이다
**And** 배경은 회색(#e5e7eb)이다
**And** 완료된 비율만큼 초록색(#22c55e)으로 채워진다
**And** 진행률 바는 부드러운 transition(300ms ease)으로 업데이트된다

**Given** 사용자가 노드를 완료한다
**When** 완료 토글을 켠다
**Then** 진행률 바가 즉시 업데이트된다
**And** "완료 X/7" 텍스트가 즉시 업데이트된다
**And** 업데이트 시 진행률 바가 pulse 애니메이션(0.5초)으로 강조된다
**And** 완료된 노드 수를 localStorage에 저장한다

**Given** 진행률 텍스트를 hover한다
**When** 마우스를 올린다
**Then** 툴팁이 표시된다
**And** 툴팁 내용: "X단계 완료, Y단계 남음" (Y = 7 - X)
**And** 툴팁은 200ms delay 후 표시된다
**And** 툴팁 배경은 검은색(90% 투명도)이다
**And** 툴팁 텍스트는 흰색이다

**Given** 7단계 모두 완료한다
**When** 마지막 노드를 완료한다
**Then** "완료 7/7" 텍스트가 초록색(#22c55e)으로 표시된다
**And** 진행률 바가 100% 초록색으로 채워진다
**And** confetti 애니메이션이 3초간 전체 화면에서 재생된다
**And** "모든 단계 완성! 정부지원사업 제안서를 생성할 수 있습니다" 메시지가 표시된다

**Given** 0단계 완료 상태이다
**When** 캔버스에 진입한다
**Then** "완료 0/7" 텍스트가 회색(#9ca3af)으로 표시된다
**And** 진행률 바는 0% 채워지지 않는다
**And** "시작하기: 첫 번째 노드를 생성하세요" 안내가 툴팁으로 표시된다

**Given** 모바일 기기에서 접속한다
**When** 화면이 로딩된다
**Then** 진행률 바는 숨겨진다 (공간 절약)
**And** "완료 X/7" 텍스트만 표시된다
**And** 텍스트는 우측 상단에 고정된다
**And** 텍스트 크기는 14px로 조정된다

**Given** 특정 Stage의 노드가 완료된다
**When** 진행률을 계산한다
**Then** 완료 기준: 노드 상태가 "completed"이거나 내용이 100자 이상인 경우
**And** 사용자가 명시적으로 "완료" 토글을 끌 수 있다 (수정 중인 경우)
**And** 토글이 꺼진 노드는 완료 수에서 제외된다

## Tasks / Subtasks

- [ ] **Implement Progress Display Component**
  - [ ] Create `frontend/src/components/header/ProgressBar.tsx`
  - [ ] Display "완료 X/7" text with bold font (700)
  - [ ] Create progress bar (200px width, 8px height)
  - [ ] Set background color to gray (#e5e7eb)
  - [ ] Fill with green (#22c55e) based on completion percentage

- [ ] **Implement Progress Calculation**
  - [ ] Count completed nodes (status === "completed" OR content >= 100 chars && toggle === on)
  - [ ] Calculate completion percentage: (completed / 7) * 100
  - [ ] Update progress bar width dynamically
  - [ ] Apply smooth transition (300ms ease)

- [ ] **Implement Progress Update Logic**
  - [ ] Listen for node status changes
  - [ ] Update progress immediately on node completion
  - [ ] Trigger pulse animation (0.5s) on update
  - [ ] Save completed count to localStorage

- [ ] **Implement Progress Tooltip**
  - [ ] Add hover event listener to progress text
  - [ ] Show tooltip after 200ms delay
  - [ ] Display: "X단계 완료, Y단계 남음"
  - [ ] Style: Black background (90% opacity), white text

- [ ] **Implement Full Completion Celebration**
  - [ ] Detect when all 7 stages completed
  - [ ] Change text color to green (#22c55e)
  - [ ] Fill progress bar to 100%
  - [ ] Trigger full-screen confetti (3 seconds)
  - [ ] Show completion message

- [ ] **Implement Mobile Responsive Layout**
  - [ ] Hide progress bar on mobile (< 768px)
  - [ ] Show only "완료 X/7" text
  - [ ] Position text in top-right corner
  - [ ] Adjust font size to 14px

- [ ] **Implement Completion Criteria Logic**
  - [ ] Check node.status === "completed"
  - [ ] OR check node.content.length >= 100 && toggle === on
  - [ ] Exclude nodes with toggle === off
  - [ ] Allow manual toggle control

## Dev Notes

### Architecture Compliance

**Tech Stack:**
- React 19 + TypeScript 5.3.3
- Redux Toolkit for state management
- Tailwind CSS 3.4.1

**File Structure:**
```
frontend/src/
├── components/header/
│   └── ProgressBar.tsx
├── hooks/
│   └── useProgress.ts
└── store/slices/
    └── progressSlice.ts
```

**Progress Calculation:**
```typescript
const calculateProgress = (nodes: Node[]) => {
  const completed = nodes.filter(node =>
    node.status === 'completed' ||
    (node.content.length >= 100 && node.toggle === true)
  ).length;
  
  return {
    completed,
    total: 7,
    percentage: (completed / 7) * 100
  };
};
```

**Progress Bar Styles:**
- Width: 200px (desktop), hidden (mobile)
- Height: 8px
- Background: #e5e7eb (gray)
- Fill: #22c55e (green)
- Transition: 300ms ease

**Confetti Configuration:**
- Trigger: When completed === 7
- Duration: 3 seconds
- Full-screen coverage

**LocalStorage:**
```typescript
// Key: 'bm_builder_progress'
{
  completed: number;
  lastUpdated: timestamp;
}
```

**Mobile Breakpoints:**
- Desktop (>= 768px): Show progress bar + text
- Mobile (< 768px): Show text only, top-right position

**Testing:**
- Unit tests for progress calculation
- Integration tests for progress updates
- Visual regression tests for progress bar rendering

## References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-006 진행 상태 시각화]
- [Source: epics-new.md#Epic 3 Story 3.2]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/header/ProgressBar.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useProgress.ts`
- `/Users/donggyu/bm-builder/frontend/src/store/slices/progressSlice.ts`
