# Story 2.2: 노드 생성 (더블클릭)

Status: done

## Story

As a 캔버스 사용자,
I want 캔버스 더블클릭으로 빠르게 노드 생성,
so that 직관적인 제스처로 빠르게 노드를 추가할 수 있다.

## Acceptance Criteria

**Given** 사용자가 빈 캔버스 영역을 더블클릭한다
**When** 더블클릭이 감지된다
**Then** 300ms timeout 내 두 번의 클릭이 감지되어야 한다
**And** 클릭 위치 좌표가 기록된다
**And** 노드 타입 선택 모달이 클릭 위치 중앙에 표시된다

**Given** 모달이 표시된다
**When** 모달이 렌더링된다
**Then** 모달은 React Portal로 렌더링되어 z-index 1000으로 표시된다
**And** 모달 배경은 50% 투명도의 검은색 오버레이이다
**And** 모달은 최대 너비 600px로 중앙 정렬된다

**Given** 사용자가 노드 타입을 선택한다
**When** 타입 카드를 클릭한다
**Then** 500ms 이내에 새 노드가 생성된다
**And** 노드 위치는 더블클릭한 좌표 중앙이다
**And** 노드 크기는 기본 200x150px이다
**And** 노드는 해당 타입 색상으로 표시된다

**Given** Progressive Disclosure가 적용된다
**When** 사용자가 Stage 1-3만 완성했다
**Then** 노드 타입 선택 모달에 Stage 1-3만 표시된다
**And** Stage 4-7 타입은 완전히 숨겨진다 (placeholder 없음)
**And** "Stage 4 이상 타입은 이전 단계 완성 후 해제됩니다" 안내가 표시된다

**Given** 모바일 기기에서 접속한다
**When** 빈 캔버스 영역을 길게 누른다
**Then** 500ms long press 후 노드 타입 선택 모달이 표시된다
**And** haptic feedback이 제공된다 (지원 기기 한)
**And** 모달이 하단에서 슬라이드 업으로 표시된다

**Given** 노드가 생성된다
**When** 생성이 완료된다
**Then** 생성된 노드가 자동으로 선택 상태가 된다
**And** 노드 주변에 2px 파란색 테두리가 표시된다
**And** 우측 사이드바가 자동으로 열린다 (200ms 이내)

**Given** 기존 노드 근처에서 더블클릭한다
**When** 새 노드가 생성된다
**Then** 새 노드와 기존 노드 간 최소 50px 간격이 유지된다
**And** 노드가 서로 겹치지 않는다
**And** 자동 레이아웃 조정이 적용된다

**Given** 오프라인 상태에서 노드를 생성한다
**When** 생성이 완료된다
**Then** LocalStorage에 노드가 저장된다
**And** "오프라인 모드: 노드가 로컬에 저장되었습니다" 토스트가 표시된다
**And** 온라인 복구 시 서버와 자동 동기화된다

## Tasks / Subtasks

- [ ] **Implement Double-Click Detection**
  - [ ] Add double-click event listener to canvas
  - [ ] Detect double-click within 300ms timeout
  - [ ] Record click coordinates (x, y)
  - [ ] Trigger node type modal at click position

- [ ] **Implement Modal Rendering with Portal**
  - [ ] Create modal component with React Portal
  - [ ] Set z-index to 1000
  - [ ] Add 50% transparent black overlay
  - [ ] Center modal with max-width 600px

- [ ] **Implement Node Creation Logic**
  - [ ] Call backend API: `POST /api/v1/nodes`
  - [ ] Create node within 500ms
  - [ ] Position node at click coordinates
  - [ ] Set default size to 200x150px
  - [ ] Apply node type color

- [ ] **Implement Auto-Layout Adjustment**
  - [ ] Detect nearby nodes within 50px
  - [ ] Calculate adjusted position to avoid overlap
  - [ ] Maintain minimum 50px gap between nodes
  - [ ] Use collision detection algorithm

- [ ] **Implement Node Auto-Selection**
  - [ ] Select newly created node automatically
  - [ ] Add 2px blue border (#3b82f6)
  - [ ] Open right sidebar within 200ms
  - [ ] Focus on node title input

- [ ] **Implement Mobile Long Press Gesture**
  - [ ] Add touch event listeners (touchstart, touchend)
  - [ ] Detect 500ms long press
  - [ ] Trigger haptic feedback (navigator.vibrate)
  - [ ] Show modal with slide-up animation from bottom

- [ ] **Implement Offline Node Creation**
  - [ ] Save to LocalStorage immediately
  - [ ] Show offline notification toast
  - [ ] Queue for sync when online (handled by Story 5.2)

## Dev Notes

### Architecture Compliance

**Tech Stack Versions:**
- React 19.0 + Vite 7.3.1
- TypeScript 5.3.3 (Strict Mode)
- Redux Toolkit 2.10.1
- Tailwind CSS 3.4.1

**Code Patterns:**
- Event-driven architecture for canvas interactions
- React Portal for modal rendering
- Service layer for API calls
- Optimistic updates with LocalStorage

**File Structure:**
```
frontend/src/
├── components/canvas/
│   ├── Canvas.tsx
│   └── NodeTypeModal.tsx
├── hooks/
│   ├── useDoubleClick.ts
│   └── useLongPress.ts
├── services/
│   └── nodeCreation.service.ts
└── utils/
    └── layout.ts
```

### Technical Requirements

**Performance Requirements:**
- Double-click detection: 300ms timeout
- Node creation: 500ms or less (NFR-002)
- Sidebar open: 200ms or less (FR-005)

**API Endpoint:**
```typescript
POST /api/v1/nodes
Request: {
  type: string;
  position: { x: number; y: number };
  canvasId: string;
}
Response: {
  success: true;
  data: Node;
}
```

**Double-Click Detection:**
```typescript
const useDoubleClick = (delay = 300) => {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setClicks(0), delay);
    return () => clearTimeout(timer);
  }, [clicks, delay]);

  return (callback: () => void) => (e: MouseEvent) => {
    setClicks(prev => {
      const newClicks = prev + 1;
      if (newClicks === 2) {
        callback();
      }
      return newClicks;
    });
  };
};
```

**Auto-Layout Algorithm:**
```typescript
const calculateNodePosition = (
  clickPosition: { x: number; y: number },
  existingNodes: Node[]
): { x: number; y: number } => {
  const MIN_GAP = 50;
  const NODE_SIZE = { width: 200, height: 150 };

  // Check for collisions and adjust position
  // ...
};
```

**Mobile Long Press:**
```typescript
const useLongPress = (delay = 500) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const start = () => {
    setTimer(setTimeout(() => {
      // Trigger long press action
      if (navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback
      }
    }, delay));
  };

  const clear = () => {
    if (timer) clearTimeout(timer);
  };

  return { onMouseDown: start, onMouseUp: clear, onTouchStart: start, onTouchEnd: clear };
};
```

**LocalStorage Schema:**
```typescript
// Key: 'bm_builder_nodes'
{
  nodes: Node[];
  timestamp: timestamp;
}
```

**Accessibility Requirements (NFR-010):**
- Keyboard alternative: Enter key to create node
- Focus management after creation
- Screen reader announcements
- Touch target: Minimum 44px on mobile

**Testing Requirements:**
- Unit tests:
  - Double-click detection logic
  - Auto-layout calculation
  - Long press gesture
- Integration tests:
  - End-to-end node creation flow
  - Offline creation behavior
- Performance tests:
  - Node creation time < 500ms

### References

- [Source: architecture.md#Frontend Architecture]
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-002 노드 생성]
- [Source: epics-new.md#Epic 2 Story 2.2]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References


### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/canvas/Canvas.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useDoubleClick.ts`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useLongPress.ts`
- `/Users/donggyu/bm-builder/frontend/src/services/nodeCreation.service.ts`
- `/Users/donggyu/bm-builder/frontend/src/utils/layout.ts`
