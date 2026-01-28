# Story 2.3: 노드 드래그 앤 드롭 이동

Status: done

## Story

As a 캔버스 사용자,
I want 노드를 드래그하여 캔버스 상에서 자유롭게 이동,
so that 원하는 위치에 노드를 배치하여 캔버스를 체계적으로 구성할 수 있다.

## Acceptance Criteria

**Given** 사용자가 노드를 클릭한다
**When** 마우스 버튼을 누른 상태로 이동한다
**Then** 100ms 이내에 드래그가 시작된다
**And** 노드가 반투명(70% 투명도)으로 표시된다
**And** 노드 상단에 "이동 중..." 표시가 나타난다
**And** 드래그 중인 노드가 z-index 100으로 다른 노드 위에 표시된다

**Given** 드래그가 진행 중이다
**When** 노드를 이동한다
**Then** 노드 위치가 실시간으로 업데이트된다
**And** 60fps로 부드럽게 렌더링된다 (requestAnimationFrame 사용)
**And** 드래그 응답 지연시간이 100ms 이내이다
**And** 캔버스 외부로 노드를 이동할 수 없다 (경계 제한)

**Given** 드래그를 종료한다 (마우스 버튼 릴리스)
**When** 드래그가 완료된다
**Then** 노드가 최종 위치에 고정된다
**And** 노드 투명도가 100%로 복원된다
**And** debounce 300ms 후 서버 API가 호출된다
**And** API 호출 성공 시 "저장됨" 토스트가 1초간 표시된다

**Given** 여러 노드를 동시에 선택한다
**When** Shift 키를 누르고 여러 노드를 클릭한다
**Then** 선택된 모든 노드가 하이라이트된다
**And** 하나의 노드를 드래그하면 선택된 모든 노드가 함께 이동한다
**And** 노드 간 상대 위치가 유지된다

**Given** 모바일 기기에서 드래그한다
**When** 터치로 노드를 이동한다
**Then** 150ms 이내에 드래그가 시작된다
**And** pinch-to-zoom 제스처가 지원된다
**And** 드래그 중 스크롤이 비활성화된다 (e.preventDefault())

**Given** 오프라인 상태에서 노드를 이동한다
**When** 드래그를 완료한다
**Then** LocalStorage에 위치가 저장된다
**And** 온라인 복구 시 서버와 자동 동기화된다
**And** 동기화 완료 시 "동기화 완료" 토스트가 표시된다

## Tasks / Subtasks

- [ ] **Implement Drag Detection**
  - [ ] Add mouse/touch event listeners to nodes
  - [ ] Detect drag start within 100ms (desktop) / 150ms (mobile)
  - [ ] Set node opacity to 70%
  - [ ] Show "이동 중..." indicator
  - [ ] Set z-index to 100 for dragged node

- [ ] **Implement Drag Movement**
  - [ ] Track mouse/touch position in real-time
  - [ ] Update node position using requestAnimationFrame (60fps)
  - [ ] Ensure drag response latency < 100ms
  - [ ] Implement canvas boundary constraints

- [ ] **Implement Drag End Handler**
  - [ ] Detect mouse up / touch end event
  - [ ] Restore node opacity to 100%
  - [ ] Debounce API call by 300ms
  - [ ] Call PATCH /api/v1/nodes/:id
  - [ ] Show "저장됨" toast on success

- [ ] **Implement Multi-Select Drag**
  - [ ] Add Shift+Click selection logic
  - [ ] Highlight selected nodes
  - [ ] Calculate relative positions
  - [ ] Move all selected nodes together

- [ ] **Implement Mobile Touch Support**
  - [ ] Add touch event listeners
  - [ ] Support pinch-to-zoom gesture
  - [ ] Disable scroll during drag (e.preventDefault())
  - [ ] Increase drag start timeout to 150ms

- [ ] **Implement Offline Position Save**
  - [ ] Save to LocalStorage immediately on drag end
  - [ ] Queue for sync when online

## Dev Notes

### Architecture Compliance

**Tech Stack:**
- React 19 + TypeScript 5.3.3
- React Flow or Konva.js (choose one for canvas rendering)
- Redux Toolkit for state management

**File Structure:**
```
frontend/src/
├── components/canvas/
│   ├── Node.tsx
│   └── DraggableNode.tsx
├── hooks/
│   └── useNodeDrag.ts
└── services/
    └── nodeUpdate.service.ts
```

**API:**
- PATCH /api/v1/nodes/:id
- Request: { position: { x, y } }
- Response: { success: true, data: Node }

**Performance:**
- Drag start: < 100ms (desktop), < 150ms (mobile)
- Render rate: 60fps using requestAnimationFrame
- API call: Debounced 300ms after drag end

**Testing:**
- Unit tests for drag logic
- Integration tests for multi-select
- Performance tests for 60fps rendering

## References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-003 노드 이동]
- [Source: epics-new.md#Epic 2 Story 2.3]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/canvas/Node.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useNodeDrag.ts`
- `/Users/donggyu/bm-builder/frontend/src/services/nodeUpdate.service.ts`
