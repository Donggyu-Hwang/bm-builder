# Story 2.1: 7단계 노드 타입 시스템 구현

Status: done

## Story

As a 캔버스 사용자,
I want 7단계 린스타트업 노드 타입 선택 및 생성,
so that 린스타트업 방법론을 체계적으로 따라갈 수 있다.

## Acceptance Criteria

**Given** 시스템이 초기화된다
**When** 노드 타입 설정을 로드한다
**Then** `src/config/nodeTypes.ts` 파일에서 7단계 노드 타입이 정의된다
**And** 각 타입은 다음 속성을 포함한다: id, label, stage(1-7), color, visibleAtStage(1-7), description, icon
**And** Stage 1: 문제 발굴 (빨간색 #ef4444, icon: 🔍)
**And** Stage 2: 문제 정의 (주황색 #f97316, icon: 🎯)
**And** Stage 3: 고객 개발 (노란색 #eab308, icon: 👥)
**And** Stage 4: 시장 개발 (초록색 #22c55e, icon: 📈)
**And** Stage 5: 솔루션 (파란색 #3b82f6, icon: 💡)
**And** Stage 6: 비즈니스 모델 캔버스 (남색 #6366f1, icon: 📊)
**And** Stage 7: IR 자료 (보라색 #a855f7, icon: 📄)

**Given** 사용자가 빈 캔버스를 더블클릭한다
**When** 노드 생성 모달이 표시된다
**Then** 7가지 노드 타입이 카드 형태로 표시된다
**And** 각 타입 카드는 해당 stage 색상과 아이콘을 포함한다
**And** 각 타입 카드는 설명 텍스트를 포함한다
**And** 카드 hover 시 해당 색상으로 강조 표시된다

**Given** Progressive Disclosure가 적용된다
**When** 사용자가 처음 캔버스에 진입한다
**Then** 처음엔 Stage 1-3 노드 타입만 표시된다
**And** "더 보기" 버튼이 제공된다
**And** Stage 4-7 타입은 "잠김" 상태로 표시되지 않는다 (완전 숨김)

**Given** 사용자가 노드 타입을 선택한다
**When** 타입 카드를 클릭한다
**Then** 선택한 타입의 노드가 생성된다
**And** 노드 배경색은 해당 타입 색상이다
**And** 노드 좌측 상단에 stage 번호와 아이콘이 표시된다

**Given** WCAG 2.1 AA 대비율 4.5:1 준수가 필요하다
**When** 노드 색상을 확인한다
**Then** 모든 노드 타입 색상은 흰색 텍스트와 4.5:1 이상 대비율을 만족한다
**And** 색맹 모드에서도 각 타입이 명확히 구분된다 (패턴 또는 아이콘으로)

**Given** 모바일 기기에서 접속한다
**When** 노드 타입 선택 모달이 표시된다
**Then** 타입 카드가 세로 스크롤로 표시된다
**And** 각 카드는 최소 44px 높이로 터치 가능하다
**And** 첫 번째 타입이 자동으로 포커스된다

**Given** 키보드만 사용한다
**When** 모달이 표시된다
**Then** Tab 키로 타입 카드 간 이동이 가능하다
**And** Enter 키로 선택이 가능하다
**And** ESC 키로 모달이 닫힌다
**And** 포커스 시각적 표시가 명확하다 (2px 파란색 테두리)

## Tasks / Subtasks

- [ ] **Define Node Types Configuration**
  - [ ] Create `frontend/src/config/nodeTypes.ts`
  - [ ] Define 7 stage node types with all properties
  - [ ] Assign colors, icons, descriptions for each stage
  - [ ] Export as constant: `NODE_TYPES`

- [ ] **Implement Node Type Selection Modal**
  - [ ] Create `frontend/src/components/canvas/NodeTypeModal.tsx`
  - [ ] Display 7 node type cards in grid layout
  - [ ] Add color and icon for each card
  - [ ] Include description text
  - [ ] Implement hover effects (highlight with type color)

- [ ] **Implement Progressive Disclosure for Node Types**
  - [ ] Create `frontend/src/hooks/useProgressiveDisclosure.ts`
  - [ ] Filter visible node types based on unlocked stages
  - [ ] Show only Stage 1-3 initially
  - [ ] Add "Show More" button (optional)
  - [ ] Completely hide locked stages (no placeholder)

- [ ] **Implement Node Type Selection Handler**
  - [ ] Create selection handler in modal component
  - [ ] Pass selected type to node creation service
  - [ ] Apply type color to node background
  - [ ] Display stage number and icon in top-left corner

- [ ] **Implement Accessibility Features**
  - [ ] Ensure WCAG 2.1 AA color contrast (4.5:1)
  - [ ] Add colorblind mode support (patterns or icons)
  - [ ] Implement keyboard navigation (Tab, Enter, ESC)
  - [ ] Add visual focus indicator (2px blue border)
  - [ ] Screen reader announcements

- [ ] **Implement Mobile Responsive Design**
  - [ ] Change layout to vertical scroll on mobile
  - [ ] Ensure minimum 44px touch target height
  - [ ] Auto-focus first card on mobile
  - [ ] Adjust card spacing for touch

## Dev Notes

### Architecture Compliance

**Tech Stack Versions:**
- React 19.0 + Vite 7.3.1
- TypeScript 5.3.3 (Strict Mode)
- Tailwind CSS 3.4.1

**Code Patterns:**
- Configuration constants in `config/`
- Reusable modal component with Portal
- Custom hooks for business logic
- Type-safe node type definitions

**File Structure:**
```
frontend/src/
├── config/
│   └── nodeTypes.ts
├── components/canvas/
│   ├── NodeTypeModal.tsx
│   └── NodeTypeCard.tsx
├── hooks/
│   └── useProgressiveDisclosure.ts
└── types/
    └── node.ts
```

### Technical Requirements

**Node Types Configuration:**
```typescript
// frontend/src/config/nodeTypes.ts
export const NODE_TYPES = [
  {
    id: 'problem-discovery',
    label: '문제 발굴',
    stage: 1,
    color: '#ef4444',
    icon: '🔍',
    description: '해결하고자 하는 문제를 발견하고 정의합니다',
    visibleAtStage: [1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: 'problem-definition',
    label: '문제 정의',
    stage: 2,
    color: '#f97316',
    icon: '🎯',
    description: '고객의 관점에서 문제를 명확히 정의합니다',
    visibleAtStage: [1, 2, 3, 4, 5, 6, 7]
  },
  // ... Stage 3-7
] as const;

export type NodeType = typeof NODE_TYPES[number];
```

**Progressive Disclosure Logic:**
```typescript
// Show only Stage 1-3 initially
const getVisibleNodeTypes = (unlockedStages: number[]) => {
  return NODE_TYPES.filter(type =>
    unlockedStages.includes(type.stage)
  );
};

// Initial state: {unlockedStages: [1, 2, 3]}
```

**WCAG 2.1 AA Color Contrast:**
- All node type colors must meet 4.5:1 contrast ratio with white text
- Use contrast checker tool during development
- Provide colorblind mode with patterns or icons

**Accessibility Requirements:**
- Keyboard navigation: Tab, Enter, ESC
- Focus management: Visual indicator (2px solid #3b82f6)
- ARIA labels for node type cards
- Screen reader announcements for selection

**Mobile Responsive Breakpoints:**
- Desktop (>= 768px): Horizontal grid layout (3 columns)
- Mobile (< 768px): Vertical scroll layout
- Touch target: Minimum 44px height

**Testing Requirements:**
- Unit tests with Vitest:
  - Node types configuration validation
  - Progressive disclosure filtering logic
- Integration tests:
  - Node type selection flow
  - Modal interaction
- Accessibility tests with axe-core
- Visual regression tests for color rendering

### References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-002 노드 생성]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-010 접근성 - WCAG 준수]
- [Source: epics-new.md#Epic 2 Story 2.1]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References


### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/config/nodeTypes.ts`
- `/Users/donggyu/bm-builder/frontend/src/components/canvas/NodeTypeModal.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/canvas/NodeTypeCard.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useProgressiveDisclosure.ts`
- `/Users/donggyu/bm-builder/frontend/src/types/node.ts`
