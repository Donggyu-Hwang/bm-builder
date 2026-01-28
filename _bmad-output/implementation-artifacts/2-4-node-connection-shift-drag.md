# Story 2.4: 노드 연결 (Shift+드래그)

Status: done

## Story

As a 캔버스 사용자,
I want Shift+드래그로 노드 간 연결선 생성,
so that 노드 간 관계를 시각화하여 흐름을 명확히 표현할 수 있다.

## Acceptance Criteria

**Given** 사용자가 Shift 키를 누르고 노드를 드래그한다
**When** 연결 모드가 활성화된다
**Then** 노드 4면에 앵커 포인트(6px 원형)가 표시된다 (top, bottom, left, right)
**And** 앵커 포인트는 해당 노드 색상으로 표시된다
**And** 가장 가까운 앵커 포인트가 자동으로 하이라이트된다

**Given** 연결 모드에서 앵커 포인트를 클릭한다
**When** 다른 노드의 앵커 포인트로 드래그한다
**Then** 드래그 중 직선 연결선이 표시된다
**And** 연결선은 100ms 이내에 렌더링된다
**And** 연결선 색상은 회색 (#9ca3af)이다
**And** 연결선 너비는 2px이다

**Given** 대상 노드의 앵커 포인트에 드롭한다
**When** 연결이 완료된다
**Then** 직선이 Bezier 곡선으로 변환된다
**And** 곡선은 부드러운 S자 형태이다
**And** 곡선 끝에 화살표가 표시된다 (6px SVG marker)
**And** 화살표 방향은 소스 노드 → 타겟 노드이다
**And** 연결 데이터가 저장된다 (sourceNodeId, targetNodeId, sourceAnchor, targetAnchor)

**Given** 연결선이 표시된다
**When** 연결선을 확인한다
**Then** 연결선은 SVG path로 렌더링된다
**And** path는 `M x1 y1 C cx1 cy1 cx2 cy2 x2 y2` 형식이다
**And** 곡률은 노드 간 거리에 따라 자동 조정된다
**And** 연결선은 z-index 50으로 노드 아래에 표시된다

**Given** 연결선을 더블클릭한다
**When** 연결선을 삭제한다
**Then** "연결을 삭제하시겠습니까?" 확인 모달이 표시된다
**And** 확인 후 연결선이 제거된다
**And** API 호출로 서버에서도 삭제된다

**Given** 연결선을 선택한 상태에서 DEL 키를 누른다
**When** 키보드로 삭제한다
**Then** 연결선이 삭제된다
**And** 확인 모달 없이 즉시 삭제된다
**And** Ctrl+Z로 실행 취소가 가능하다

**Given** 이미 연결된 노드 간에 다시 연결을 시도한다
**When** 중복 연결을 생성하려 한다
**Then** "이미 연결된 노드입니다" 토스트가 표시된다
**And** 중복 연결이 생성되지 않는다

**Given** 같은 노드 내에서 연결을 시도한다 (self-loop)
**When** 자기 자신에게 연결하려 한다
**Then** "자기 자신에게는 연결할 수 없습니다" 토스트가 표시된다
**And** 연결이 생성되지 않는다

## Tasks / Subtasks

- [ ] **Implement Connection Mode Activation**
  - [ ] Detect Shift key press + node drag
  - [ ] Show anchor points on all 4 sides (6px circles)
  - [ ] Highlight nearest anchor point
  - [ ] Set anchor colors to match node colors

- [ ] **Implement Connection Line Rendering**
  - [ ] Create SVG path for straight line during drag
  - [ ] Render line within 100ms
  - [ ] Set line color to gray (#9ca3af)
  - [ ] Set line width to 2px
  - [ ] Set z-index to 50 (below nodes)

- [ ] **Implement Bezier Curve Connection**
  - [ ] Convert straight line to Bezier curve on drop
  - [ ] Calculate control points for smooth S-curve
  - [ ] Add arrow marker (6px SVG marker)
  - [ ] Set direction: source → target

- [ ] **Implement Connection Deletion**
  - [ ] Add double-click event handler to connections
  - [ ] Show confirmation modal
  - [ ] Call DELETE /api/v1/connections/:id
  - [ ] Support DEL key for immediate deletion
  - [ ] Integrate with undo/redo (Ctrl+Z)

- [ ] **Implement Connection Validation**
  - [ ] Check for duplicate connections
  - [ ] Prevent self-loop connections
  - [ ] Show error toasts for invalid connections

- [ ] **Implement Connection Data Structure**
  - [ ] Create Connection interface
  - [ ] Store: {id, sourceNodeId, targetNodeId, sourceAnchor, targetAnchor}
  - [ ] Generate UUID v4 for connection ID
  - [ ] Implement cascade delete when nodes are deleted

## Dev Notes

### Architecture Compliance

**Tech Stack:**
- React 19 + TypeScript 5.3.3
- SVG for connection line rendering
- Redux Toolkit for state management

**File Structure:**
```
frontend/src/
├── components/canvas/
│   ├── ConnectionLine.tsx
│   └── AnchorPoint.tsx
├── hooks/
│   └── useConnection.ts
└── services/
    └── connection.service.ts
```

**API Endpoints:**
- POST /api/v1/connections
- DELETE /api/v1/connections/:id
- Request: { sourceNodeId, targetNodeId, sourceAnchor, targetAnchor }

**Data Structure:**
```typescript
interface Connection {
  id: string; // UUID v4
  sourceNodeId: string;
  targetNodeId: string;
  sourceAnchor: 'top' | 'bottom' | 'left' | 'right';
  targetAnchor: 'top' | 'bottom' | 'left' | 'right';
}
```

**Bezier Curve Formula:**
```
M x1 y1 C cx1 cy1 cx2 cy2 x2 y2
```

**Performance:**
- Connection render time: < 100ms
- 60fps animation during drag

**Testing:**
- Unit tests for connection validation
- Integration tests for creation/deletion
- Visual regression tests for SVG rendering

## References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-004 노드 연결]
- [Source: epics-new.md#Epic 2 Story 2.4]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/canvas/ConnectionLine.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/canvas/AnchorPoint.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useConnection.ts`
- `/Users/donggyu/bm-builder/frontend/src/services/connection.service.ts`
