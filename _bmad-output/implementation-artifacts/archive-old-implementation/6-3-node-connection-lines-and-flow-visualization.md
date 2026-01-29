# Story 6.3: Node Connection Lines 및 Flow Visualization

## Epic 6: Visual Workflow Management (Node UI)

---

## Story Information

**Story ID:** 6.3
**Story Title:** Node Connection Lines 및 Flow Visualization
**Status:** ready-for-dev
**Priority:** Medium
**Phase:** Phase 3 (Post-MVP)

---

## User Story

**As a** 사용자,
**I want** 노드 간 연결 선을 명확하게 보고 flow를 이해할 수 있길 원해서,
**So that** 문서 생성 논리를 시각적으로 파악할 수 있다.

---

## Acceptance Criteria

### Given 사용자가 Node UI에 있을 때
### When Node connections이 렌더링되면
### Then 다음 connection styles이 적용된다:
  - Line type: Bezier curve (smooth)
  - Line width: 2px
  - Color: #94a3b8 (slate-400)
  - Arrow: 마지막 node에 화살표

### And Connection lines이 다음을 표시한다:
  - Flow direction: Start → End
  - Data flow: "AI 생성" nodes에서 나오는 lines은 dashed
  - Dependency: Mandatory paths는 solid, optional은 gray

### When 사용자가 connection line을 hover하면
### Then Connection detail tooltip이 표시된다:
  - Source node: "프로젝트 개요"
  - Target node: "시장 분석"
  - Relationship type: "Sequential"
  - Data flow: "AI에서 1,500자 복사"

### And Connection이 강조표시된다:
  - Line width: 3px
  - Color: #4CAF50 (green)
  - Connected nodes: Subtle glow

### Given 사용자가 connection을 클릭할 때
### When Connection line을 click하면
### Then Connection edit modal이 열린다:
  - Relationship type: "Sequential" | "Parallel" | "Conditional"
  - Label: "AI 생성에서 복사"
  - "연결 해제" 버튼

### When 사용자가 "연결 해제"를 클릭하면
### Then Connection이 삭제되고 nodes가 분리된다:
  - Confirmation required
  - Undo 가능 (Ctrl/Cmd + Z)

### Given 복잡한 flow가 있을 때
### When User가 "Simplify view"를 toggle하면
### Then Minor connections이 숨겨진다:
  - AI generation connections 숨김
  - Major sections만 연결 표시
  - Toggle button: "간단히 보기" | "자세히 보기"

---

## Technical Implementation Details

### Frontend Components

**1. Custom Edge Component (`CustomEdge.tsx`)**

```typescript
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@reactflow/core';
import { useState } from 'react';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  data: {
    label: string;
    type: 'sequential' | 'parallel' | 'conditional';
    dataFlow: string;
    isMandatory: boolean;
    isAIConnection: boolean;
  };
}

export const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Edge style based on type
  const edgeStyle = {
    stroke: isHovered ? '#4CAF50' : '#94a3b8',
    strokeWidth: isHovered ? 3 : 2,
    strokeDasharray: data.isAIConnection ? '5,5' : 'none',
    opacity: data.isMandatory ? 1 : 0.5,
  };

  // Connection detail tooltip
  const tooltip = (
    <div className="connection-tooltip">
      <div className="tooltip-content">
        <p><strong>Source:</strong> {data.sourceNode}</p>
        <p><strong>Target:</strong> {data.targetNode}</p>
        <p><strong>Type:</strong> {data.type}</p>
        {data.dataFlow && <p><strong>Data Flow:</strong> {data.dataFlow}</p>}
      </div>
    </div>
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => openConnectionEditModal(id)}
      />
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="edge-label"
          >
            {tooltip}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
```

**2. Connection Edit Modal (`ConnectionEditModal.tsx`)**

```typescript
interface ConnectionEditModalProps {
  edge: Edge;
  onClose: () => void;
  onSave: (edgeId: string, updates: Partial<EdgeData>) => void;
  onDelete: (edgeId: string) => void;
}

export const ConnectionEditModal: React.FC<ConnectionEditModalProps> = ({
  edge,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<EdgeData['type']>(edge.data.type);
  const [label, setLabel] = useState(edge.data.label || '');

  const handleSave = () => {
    onSave(edge.id, { type, label });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('정말 연결을 해제하시겠습니까?')) {
      onDelete(edge.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalHeader>
        <h2>연결 편집</h2>
      </ModalHeader>
      <ModalBody>
        <Select
          label="관계 유형"
          value={type}
          onChange={setType}
          options={[
            { value: 'sequential', label: '순차적 (Sequential)' },
            { value: 'parallel', label: '병렬 (Parallel)' },
            { value: 'conditional', label: '조건부 (Conditional)' },
          ]}
        />
        <Input
          label="라벨"
          value={label}
          onChange={setLabel}
          placeholder="예: AI 생성에서 복사"
        />
        <InfoBox>
          <p><strong>관계 유형 설명:</strong></p>
          <ul>
            <li>순차적: 선행 노드 완료 후 다음 노드 실행</li>
            <li>병렬: 동시에 실행 가능</li>
            <li>조건부: 특정 조건에서만 실행</li>
          </ul>
        </InfoBox>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          연결 해제
        </Button>
        <Button variant="primary" onClick={handleSave}>
          저장
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

**3. Flow Simplification Toggle (`FlowSimplifier.tsx`)**

```typescript
export const useFlowSimplification = () => {
  const [isSimplified, setIsSimplified] = useState(false);

  const simplifyEdges = (edges: Edge[]): Edge[] => {
    if (!isSimplified) return edges;

    // Hide AI generation connections
    return edges.filter(edge => !edge.data.isAIConnection);
  };

  const toggleSimplification = () => {
    setIsSimplified(prev => !prev);
  };

  return {
    isSimplified,
    simplifyEdges,
    toggleSimplification,
  };
};

// UI Component
export const SimplificationToggle: React.FC = () => {
  const { isSimplified, toggleSimplification } = useFlowSimplification();

  return (
    <button
      onClick={toggleSimplification}
      className="simplification-toggle"
    >
      {isSimplified ? '자세히 보기' : '간단히 보기'}
    </button>
  );
};
```

### State Management (Redux)

**Slice: `connectionSlice.ts`**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  edges: Edge[];
  selectedEdgeId: string | null;
  isSimplified: boolean;
}

const initialState: ConnectionState = {
  edges: [],
  selectedEdgeId: null,
  isSimplified: false,
};

const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    updateEdge: (state, action: PayloadAction<{ edgeId: string; data: Partial<EdgeData> }>) => {
      const edge = state.edges.find(e => e.id === action.payload.edgeId);
      if (edge) {
        edge.data = { ...edge.data, ...action.payload.data };
      }
    },
    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter(e => e.id !== action.payload);
    },
    setSelectedEdge: (state, action: PayloadAction<string | null>) => {
      state.selectedEdgeId = action.payload;
    },
    toggleSimplification: (state) => {
      state.isSimplified = !state.isSimplified;
    },
  },
});

export const {
  updateEdge,
  deleteEdge,
  setSelectedEdge,
  toggleSimplification,
} = connectionSlice.actions;

export default connectionSlice.reducer;
```

### API Endpoints

**Backend Routes**

```typescript
// PUT /api/v1/connections/:connectionId
// Update connection data
router.put('/connections/:connectionId', authenticate, async (req, res) => {
  const { connectionId } = req.params;
  const { type, label } = req.body;

  const updatedConnection = await updateConnection(connectionId, { type, label });

  res.json({
    success: true,
    data: updatedConnection,
  });
});

// DELETE /api/v1/connections/:connectionId
// Delete connection
router.delete('/connections/:connectionId', authenticate, async (req, res) => {
  const { connectionId } = req.params;

  await deleteConnection(connectionId);

  res.json({
    success: true,
    message: 'Connection deleted successfully',
  });
});
```

### Database Schema

**PostgreSQL Tables**

```sql
-- Connections stored within document nodes
ALTER TABLE documents ADD COLUMN edges JSONB DEFAULT '[]';

-- Edge structure
{
  "id": "edge-1",
  "source": "node-1",
  "target": "node-2",
  "type": "sequential",
  "label": "AI 생성에서 복사",
  "dataFlow": "AI에서 1,500자 복사",
  "isMandatory": true,
  "isAIConnection": false,
  "sourceHandle": "output",
  "targetHandle": "input"
}
```

---

## Testing Requirements

### Unit Tests

**Edge Rendering**

```typescript
describe('CustomEdge', () => {
  it('should render bezier curve path', () => {
    const { container } = render(
      <CustomEdge
        id="edge-1"
        sourceX={100}
        sourceY={100}
        targetX={300}
        targetY={300}
        sourcePosition="right"
        targetPosition="left"
        data={{}}
      />
    );

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toContain('C'); // Bezier curve
  });

  it('should apply dashed line for AI connections', () => {
    const { container } = render(
      <CustomEdge
        id="edge-1"
        sourceX={100}
        sourceY={100}
        targetX={300}
        targetY={300}
        sourcePosition="right"
        targetPosition="left"
        data={{ isAIConnection: true }}
      />
    );

    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke-dasharray')).toBe('5,5');
  });
});
```

**Flow Simplification**

```typescript
describe('useFlowSimplification', () => {
  it('should filter AI connections when simplified', () => {
    const { result } = renderHook(() => useFlowSimplification());

    const edges = [
      { id: 'edge-1', data: { isAIConnection: true } },
      { id: 'edge-2', data: { isAIConnection: false } },
    ];

    act(() => {
      result.current.toggleSimplification();
    });

    const simplified = result.current.simplifyEdges(edges);
    expect(simplified).toHaveLength(1);
    expect(simplified[0].id).toBe('edge-2');
  });
});
```

### Integration Tests

**Connection Edit Flow**

```typescript
describe('Connection Edit E2E', () => {
  it('should open edit modal on click', async () => {
    render(<NodeCanvas />);

    const edge = screen.getByTestId('edge-1');
    await fireEvent.click(edge);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('연결 편집')).toBeInTheDocument();
  });

  it('should update connection type', async () => {
    render(<NodeCanvas />);

    const edge = screen.getByTestId('edge-1');
    await fireEvent.click(edge);

    const typeSelect = screen.getByLabelText('관계 유형');
    await fireEvent.change(typeSelect, { target: { value: 'parallel' } });

    const saveButton = screen.getByText('저장');
    await fireEvent.click(saveButton);

    expect(edge).toHaveAttribute('data-type', 'parallel');
  });
});
```

---

## Dependencies

### External Libraries

```json
{
  "dependencies": {
    "@reactflow/core": "^11.10.0",
    "reactflow": "^11.10.0"
  }
}
```

### Prerequisite Stories

- [x] **Story 6.1:** Node-based Canvas 기본 구조 (Must be completed first)
- [x] **Story 6.2:** Node Drag-and-Drop 및 편집
- [ ] **Story 6.4:** Infinite Canvas 및 Navigation (Next)

---

## Definition of Done

- [x] Story 파일 생성됨
- [ ] Bezier curve connection lines 구현 완료
- [ ] Edge hover tooltip 구현 완료
- [ ] Connection edit modal 구현 완료
- [ ] Relationship type 수정 가능 (Sequential/Parallel/Conditional)
- [ ] Connection 삭제 기능 구현 완료 (confirmation 포함)
- [ ] Flow simplification toggle 구현 완료
- [ ] AI connection dashed line 스타일 적용
- [ ] Undo/Redo support for connection operations
- [ ] Unit tests 작성 완료 (80%+ coverage)
- [ ] Integration tests 작성 완료
- [ ] Code review 완료
- [ ] 배포 및 QA 통과

---

## Implementation Notes

### Visual Design Guidelines

1. **Bezier Curve Calculation:**
   - Use React Flow's `getBezierPath()` for smooth curves
   - Control points: 50% horizontal distance from source/target
   - Adjust curvature based on node distance

2. **Edge Styling:**
   - Normal: 2px width, #94a3b8 color
   - Hovered: 3px width, #4CAF50 color
   - AI Connection: Dashed line (5,5 pattern)
   - Optional: 50% opacity, gray color

3. **Arrow Markers:**
   - SVG marker at target node
   - Size: 10x10px
   - Color: Match edge color

### Performance Considerations

1. **Edge Rendering:**
   - Use SVG for crisp rendering at any zoom level
   - Batch edge updates with `requestAnimationFrame`
   - Virtualize edges for 100+ connections

2. **Hover Effects:**
   - Debounce hover events (100ms delay)
   - Only render tooltip when edge is hovered
   - Use CSS transforms for smooth transitions

### Edge Cases

- Self-loops (node connects to itself) → Warn user or prevent
- Duplicate connections → Merge or warn user
- Circular dependencies → Detect and warn
- Long connections spanning multiple screens → Add mid-point anchors

### Accessibility

- Keyboard navigation: Tab to select edges, Enter to edit
- High contrast mode: Thicker lines, brighter colors
- Screen reader: Announce connection source/target/type
- Focus indicators for selected edges

---

## References

- [React Flow Custom Edges](https://reactflow.dev/docs/examples/edges/custom-edge/)
- [Bezier Curve Visualization](https://www.jasondavies.com/animated-bezier/)
- [SVG Path Commands](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [Flow Visualization Best Practices](https://www.nngroup.com/articles/flowcharts/)

---

**Last Updated:** 2026-01-18
**Status:** ready-for-dev
**Assignee:** TBD
**Sprint:** TBD
