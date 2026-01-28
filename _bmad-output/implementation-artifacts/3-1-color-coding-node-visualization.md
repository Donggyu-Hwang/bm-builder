# Story 3.1: 색상 코딩 및 노드 상태 시각화

Status: done

## Story

As a 캔버스 사용자,
I want 노드 완료 상태를 색상으로 시각화,
so that 한눈에 진행 상태를 파악할 수 있다.

## Acceptance Criteria

**Given** 노드가 생성된다
**When** 아직 내용이 추가되지 않았다
**Then** 노드 상태는 "not_started"이다
**And** 노드 배경색은 회색 (#e5e7eb)이다
**And** 노드 테두리는 점선(2px dashed #9ca3af)이다
**And** 노드 좌측 상단에 ⭕ 아이콘이 표시된다
**And** "미시작" 상태 텍스트가 노드 하단에 표시된다

**Given** 사용자가 노드에 내용을 추가하기 시작한다
**When** 내용이 1자 이상 추가된다
**Then** 노드 상태가 "in_progress"로 자동 변경된다
**And** 노드 배경색은 노란색 (#fef3c7)이다
**And** 노드 테두리는 실선(2px solid #f59e0b)이다
**And** 노드 좌측 상단에 ⏳ 아이콘이 표시된다
**And** "진행 중" 상태 텍스트가 노드 하단에 표시된다

**Given** 사용자가 노드 내용을 최소 100자 이상 작성한다
**When** "완료" 토글을 켠다
**Then** 노드 상태가 "completed"로 변경된다
**And** 노드 배경색은 초록색 (#dcfce7)이다
**And** 노드 테두리는 굵은 실선(3px solid #22c55e)이다
**And** 노드 좌측 상단에 ✅ 아이콘이 표시된다
**And** "완료" 상태 텍스트가 노드 하단에 굵게 표시된다

**Given** 노드가 완료 상태로 변경된다
**When** 상태 변경이 완료된다
**Then** confetti 애니메이션이 1초간 노드 주변에서 재생된다
**And** "완료! 축합니다!" 토스트가 1초간 표시된다
**And** 진행률 바가 즉시 업데이트된다

**Given** 색맹 모드가 활성화된다
**When** 노드 상태를 확인한다
**Then** 각 상태는 아이콘(⭕ ⏳ ✅)으로 명확히 구분된다
**And** WCAG 2.1 AA 대비율 4.5:1이 준수된다
**And** 상태 텍스트가 항상 표시된다

**Given** 진행 중 상태인 노드가 24시간 동안 업데이트되지 않는다
**When** 시스템이 확인한다
**Then** 노드 테두리가 주황색(#f97316)으로 깜빡인다 (attention indicator)
**And** "마지막 수정: 24시간 전" 텍스트가 표시된다
**And** 노드 hover 시 "계속 작성하기" 버튼이 표시된다

**Given** 키보드만 사용한다
**When** 노드를 선택하고 "완료" 토글을 조작한다
**Then** Space 키로 토글 on/off가 가능하다
**And** 토글 상태 변경 시 화면 reader가 "완료 상태로 변경되었습니다"를 읽어준다

## Tasks / Subtasks

- [ ] **Define Node Status Types**
  - [ ] Create NodeStatus type: "not_started" | "in_progress" | "completed"
  - [ ] Define color mapping for each status
  - [ ] Define icon mapping for each status

- [ ] **Implement Status Detection Logic**
  - [ ] Detect when content length >= 1 (change to in_progress)
  - [ ] Detect when content length >= 100 (eligible for completion)
  - [ ] Track last update timestamp
  - [ ] Check for 24-hour inactivity

- [ ] **Implement Visual Status Indicators**
  - [ ] Apply background colors based on status
  - [ ] Apply border styles (dashed/solid/thick)
  - [ ] Display status icons (⭕ ⏳ ✅)
  - [ ] Display status text labels

- [ ] **Implement Completion Toggle**
  - [ ] Add toggle switch in node sidebar
  - [ ] Enable toggle when content >= 100 chars
  - [ ] Handle toggle on/off
  - [ ] Support Space key for keyboard users
  - [ ] Add screen reader announcements

- [ ] **Implement Completion Celebration**
  - [ ] Trigger confetti animation (1 second)
  - [ ] Show success toast
  - [ ] Update progress bar immediately

- [ ] **Implement Attention Indicator**
  - [ ] Check for 24-hour inactivity
  - [ ] Blink border with orange color (#f97316)
  - [ ] Display "Last modified: 24h ago" text
  - [ ] Show "Continue writing" button on hover

- [ ] **Ensure Colorblind Accessibility**
  - [ ] Maintain WCAG 2.1 AA contrast (4.5:1)
  - [ ] Always show status text
  - [ ] Use icons for clear distinction
  - [ ] Test with colorblind simulation tools

## Dev Notes

### Architecture Compliance

**Tech Stack:**
- React 19 + TypeScript 5.3.3
- Redux Toolkit for state management
- Tailwind CSS 3.4.1

**File Structure:**
```
frontend/src/
├── components/canvas/
│   └── Node.tsx
├── hooks/
│   └── useNodeStatus.ts
└── types/
    └── node.ts
```

**Node Status Types:**
```typescript
type NodeStatus = 'not_started' | 'in_progress' | 'completed';

interface NodeStatusConfig {
  not_started: {
    backgroundColor: '#e5e7eb';
    borderColor: '#9ca3af';
    borderStyle: 'dashed';
    borderWidth: 2;
    icon: '⭕';
    label: '미시작';
  };
  in_progress: {
    backgroundColor: '#fef3c7';
    borderColor: '#f59e0b';
    borderStyle: 'solid';
    borderWidth: 2;
    icon: '⏳';
    label: '진행 중';
  };
  completed: {
    backgroundColor: '#dcfce7';
    borderColor: '#22c55e';
    borderStyle: 'solid';
    borderWidth: 3;
    icon: '✅';
    label: '완료';
  };
}
```

**Status Detection Logic:**
- content.length === 0 → not_started
- content.length >= 1 → in_progress
- content.length >= 100 && toggle === on → completed

**Attention Indicator:**
- Check: now - lastUpdate > 24 hours
- Animation: CSS keyframes for blinking
- Border color: #f97316 (orange)

**Accessibility (NFR-010):**
- WCAG 2.1 AA compliance
- Icons + text for all statuses
- Space key for toggle
- Screen reader: "완료 상태로 변경되었습니다"

**Testing:**
- Unit tests for status detection
- Visual regression tests for color rendering
- Accessibility tests with axe-core

## References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-006 진행 상태 시각화]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-010 접근성 - WCAG 준수]
- [Source: epics-new.md#Epic 3 Story 3.1]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/canvas/Node.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useNodeStatus.ts`
- `/Users/donggyu/bm-builder/frontend/src/types/node.ts`
