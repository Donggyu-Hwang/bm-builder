# Story 6.4: Infinite Canvas 및 Navigation

## Epic 6: Visual Workflow Management (Node UI)

---

## Story Information

**Story ID:** 6.4
**Story Title:** Infinite Canvas 및 Navigation
**Status:** ready-for-dev
**Priority:** Medium
**Phase:** Phase 3 (Post-MVP)

---

## User Story

**As a** 사용자,
**I want** 무한 캔버스에서 확대/축소하고 원하는 영역으로 이동할 수 있길 원해서,
**So that** 대규모 워크플로우도 효율적으로 탐색할 수 있다.

---

## Acceptance Criteria

### Given 사용자가 Node UI에 있을 때
### When 사용자가 zoom controls을 사용하면
### Then 다음 zoom options이 제공된다:
  - Zoom buttons: `+` `-` buttons (bottom-right)
  - Zoom levels: 25%, 50%, 75%, 100%, 150%, 200%
  - Current zoom: "100%" 표시
  - Fit to screen: "화면에 맞추기" button

### And Zoom animations이 적용된다:
  - Duration: 200ms
  - Easing: ease-in-out
  - Center on zoom: 마우스 위치 중심으로 zoom

### When 사용자가 pan하면
### Then 다음 pan gestures가 지원된다:
  - Mouse drag + Space key pressed
  - Middle mouse button drag
  - Touch: Two-finger drag
  - Mini-map: Small overview map (bottom-left)

### And Mini-map이 다음을 표시한다:
  - All nodes: Small rectangles
  - Viewport: Blue rectangle overlay
  - Draggable viewport: Mini-map에서 drag하여 pan
  - Size: 200x150px

### Given 사용자가 특정 node를 찾을 때
### When 사용자가 "노드 찾기"를 클릭하면
### Then Node search modal이 열린다:
  - Search input: Node title 검색
  - Results: Matching nodes 목록
  - "이동" 버튼: 해당 node로 focus + zoom in

### And Node로 이동할 때:
  - Smooth pan animation (500ms)
  - Auto zoom: Node가 화면 중앙에 위치
  - Highlight: Node가 1초간 pulse animation

### When 사용자가 "Reset view"를 클릭하면
### Then Canvas가 초기 상태로 복귀한다:
  - Zoom: 100%
  - Position: (0, 0)
  - All nodes visible

### Given 100+ nodes가 있을 때
### When Canvas가 렌더링되면
### Then Virtualization이 적용된다:
  - Only visible nodes rendered (viewport + 50% margin)
  - Off-screen nodes: Unmounted
  - Performance: 60fps maintained with 500+ nodes

---

## Technical Implementation Details

### Frontend Components

**1. Zoom Controls (`ZoomControls.tsx`)**

```typescript
import { useReactFlow } from '@reactflow/core';
import { useState } from 'react';

export const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [currentZoom, setCurrentZoom] = useState(100);

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
    setCurrentZoom(Math.min(getZoom() * 100 + 25, 200));
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
    setCurrentZoom(Math.max(getZoom() * 100 - 25, 25));
  };

  const handleFitView = () => {
    fitView({ duration: 200, padding: 0.2 });
    setCurrentZoom(100);
  };

  return (
    <div className="zoom-controls">
      <button onClick={handleZoomOut} aria-label="Zoom out">−</button>
      <span className="zoom-level">{Math.round(currentZoom)}%</span>
      <button onClick={handleZoomIn} aria-label="Zoom in">+</button>
      <button onClick={handleFitView} aria-label="Fit to screen">화면에 맞추기</button>
    </div>
  );
};
```

**2. Mini-map Component**

```typescript
import { useReactFlow } from '@reactflow/core';

export const MiniMap: React.FC = () => {
  const { getNodes, getViewport, setViewport } = useReactFlow();
  const nodes = getNodes();
  const viewport = getViewport();

  // Calculate minimap bounds and scale
  const minimapConfig = useMemo(() => {
    const bounds = calculateBounds(nodes);
    const scale = calculateScale(bounds, 200, 150);
    return { bounds, scale };
  }, [nodes]);

  return (
    <div className="minimap" style={{ width: 200, height: 150 }}>
      <svg width="100%" height="100%">
        {nodes.map(node => (
          <rect
            key={node.id}
            x={node.position.x * minimapConfig.scale}
            y={node.position.y * minimapConfig.scale}
            width={50 * minimapConfig.scale}
            height={30 * minimapConfig.scale}
            fill={node.data.color}
          />
        ))}
        <rect
          x={viewport.x * minimapConfig.scale}
          y={viewport.y * minimapConfig.scale}
          width={window.innerWidth * viewport.zoom * minimapConfig.scale}
          height={window.innerHeight * viewport.zoom * minimapConfig.scale}
          fill="none"
          stroke="#2196F3"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
};
```

**3. Node Search Modal**

```typescript
import { useReactFlow } from '@reactflow/core';
import { useState } from 'react';

export const NodeSearch: React.FC = () => {
  const { getNodes, fitView } = useReactFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const nodes = getNodes();
  const results = nodes.filter(node =>
    node.data.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (nodeId: string) => {
    fitView({ nodes: [{ id: nodeId, padding: 0.5 }], duration: 500 });
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>🔍 노드 찾기</button>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <Input
            placeholder="노드 제목 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul>
            {results.map(node => (
              <li key={node.id}>
                <button onClick={() => handleSelect(node.id)}>
                  {node.data.title}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
};
```

**4. Node Virtualization Hook**

```typescript
export const useNodeVirtualization = () => {
  const { getNodes, getViewport } = useReactFlow();

  const visibleNodes = useMemo(() => {
    const allNodes = getNodes();
    const viewport = getViewport();

    // Calculate viewport bounds with 50% margin
    const margin = 0.5;
    const bounds = {
      x: -viewport.x / viewport.zoom - (window.innerWidth * margin),
      y: -viewport.y / viewport.zoom - (window.innerHeight * margin),
      width: window.innerWidth / viewport.zoom * (1 + margin * 2),
      height: window.innerHeight / viewport.zoom * (1 + margin * 2),
    };

    return allNodes.filter(node => isNodeInBounds(node, bounds));
  }, [getNodes, getViewport]);

  return { visibleNodes };
};
```

### State Management (Redux)

```typescript
// canvasSlice.ts
const canvasSlice = createSlice({
  name: 'canvas',
  initialState: {
    zoom: 1,
    viewport: { x: 0, y: 0, zoom: 1 },
  },
  reducers: {
    setZoom: (state, action) => {
      state.zoom = action.payload;
      state.viewport.zoom = action.payload;
    },
    setViewport: (state, action) => {
      state.viewport = action.payload;
    },
    resetView: (state) => {
      state.zoom = 1;
      state.viewport = { x: 0, y: 0, zoom: 1 };
    },
  },
});
```

### CSS Styles

```css
.zoom-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

.minimap {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 1000;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
}

.pulse-highlight {
  animation: pulse 1s ease-in-out;
}
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('ZoomControls', () => {
  it('should zoom in by 25%', () => {
    // Test zoom in functionality
  });

  it('should not exceed 200% zoom', () => {
    // Test zoom limit
  });
});

describe('NodeSearch', () => {
  it('should filter nodes by query', () => {
    // Test search filtering
  });

  it('should navigate to selected node', () => {
    // Test node navigation
  });
});
```

### Integration Tests

```typescript
describe('Canvas Navigation E2E', () => {
  it('should pan canvas with space + drag', async () => {
    // Test pan functionality
  });

  it('should zoom in on scroll', async () => {
    // Test zoom on scroll
  });
});
```

---

## Dependencies

```json
{
  "dependencies": {
    "@reactflow/core": "^11.10.0",
    "reactflow": "^11.10.0"
  }
}
```

### Prerequisite Stories

- [x] Story 6.1: Node-based Canvas 기본 구조
- [x] Story 6.2: Node Drag-and-Drop 및 편집
- [x] Story 6.3: Node Connection Lines 및 Flow Visualization
- [ ] Story 6.5: Node UI Export 및 공유 (Next)

---

## Definition of Done

- [x] Story 파일 생성됨
- [ ] Zoom controls (25%-200%) 구현 완료
- [ ] Mini-map 구현 완료
- [ ] Node search modal 구현 완료
- [ ] Node virtualization 적용
- [ ] 60fps performance with 500+ nodes
- [ ] Unit tests 작성 완료
- [ ] Integration tests 작성 완료
- [ ] Code review 완료
- [ ] 배포 및 QA 통과

---

## Implementation Notes

### Performance Optimization
- Only render nodes in viewport + 50% margin
- Use React.memo for node components
- Debounce viewport updates (50ms)
- Use CSS transforms for smooth animations

### User Experience
- All transitions: 200-500ms with ease-in-out
- Touch gestures: Two-finger pan, pinch zoom
- Keyboard shortcuts: Space+drag, +/- zoom, 0 reset
- Pulse animation on node focus

### Accessibility
- Keyboard navigation: Arrow keys to pan, +/- to zoom
- Screen reader: Announce zoom level and viewport position
- High contrast mode support
- Visible focus indicators

---

## References

- [React Flow Viewport](https://reactflow.dev/docs/api/core/types/#viewport)
- [Canvas Virtualization](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [Infinite Canvas Implementation](https://www.figma.com/blog/how-we-built-the-figma-multiplayer-editor/)

---

**Last Updated:** 2026-01-18
**Status:** ready-for-dev
**Assignee:** TBD
**Sprint:** TBD
