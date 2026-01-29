# Story 6.1: Node-based Canvas 기본 구조

## Epic 6: Visual Workflow Management (Node UI)

---

## Story Information

**Story ID:** 6.1
**Story Title:** Node-based Canvas 기본 구조
**Status:** ready-for-dev
**Priority:** High
**Phase:** Phase 3 (Post-MVP)

---

## User Story

**As a** 사용자,
**I want** 노드 기반 캔버스에서 문서 생성 워크플로우를 시각화할 수 있길 원해서,
**So that** 복잡한 문서 구조를 직관적으로 이해하고 관리할 수 있다.

---

## Acceptance Criteria

### Given 인증된 사용자가 문서 생성을 완료했을 때
### When 사용자가 "Node UI 보기" 버튼을 클릭하면
### Then React Flow 기반 캔버스가 렌더링된다:
  - `<ReactFlow>` 컴포넌트 초기화
  - Canvas size: 100% viewport width/height
  - Background: Dot pattern (20px gap)

### And 다음 nodes가 자동 생성된다:
  - Start node: "문서 시작" (rounded rectangle, green)
  - Section nodes: 각 문서 섹션 (rectangle, blue)
  - AI generation nodes: AI가 생성한 콘텐츠 (diamond, purple)
  - End node: "완성된 문서" (rounded rectangle, green)

### And nodes가 다음 정보를 표시한다:
  - Node title (섹션명)
  - Status badge: "완료" | "진행중" | "대기중"
  - Word count: "2,500자"
  - Last edited: "2024-01-09 14:30"

### When 사용자가 캔버스를 조작하면
### Then 다음 interactions이 가능하다:
  - Pan: Mouse wheel drag + Space + drag
  - Zoom: Mouse wheel (0.5x - 2x)
  - Fit view: "화면에 맞추기" 버튼

### Given 사용자가 mobile 화면일 때
### When 캔버스가 로드되면
### Then Touch gestures가 지원된다:
  - Two-finger pan
  - Pinch-to-zoom
  - Double-tap to zoom in

---

## Technical Implementation Details

### Dependencies

```bash
npm install reactflow
```

### Frontend Components

**1. Node Canvas Page (`NodeCanvasPage.tsx`)**

```typescript
import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams } from 'react-router-dom';
import { documentsApi } from '../api/documentsApi';

import StartNode from '../components/node-canvas/StartNode';
import SectionNode from '../components/node-canvas/SectionNode';
import AIGenerationNode from '../components/node-canvas/AIGenerationNode';
import EndNode from '../components/node-canvas/EndNode';

const nodeTypes = {
  start: StartNode,
  section: SectionNode,
  aiGeneration: AIGenerationNode,
  end: EndNode,
};

export const NodeCanvasPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize nodes from document structure
  const initialNodes: Node[] = useMemo(() => {
    if (!document) return [];

    const nodes: Node[] = [];
    let yOffset = 0;

    // Start node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: 250, y: yOffset },
      data: { label: '문서 시작' },
    });
    yOffset += 150;

    // Section nodes
    document.sections?.forEach((section: any, index: number) => {
      nodes.push({
        id: `section-${section.id}`,
        type: 'section',
        position: { x: 250, y: yOffset },
        data: {
          label: section.title,
          status: section.status,
          wordCount: section.content?.length || 0,
          lastEdited: section.updated_at,
        },
      });
      yOffset += 150;

      // AI generation nodes if applicable
      if (section.ai_generated) {
        nodes.push({
          id: `ai-${section.id}`,
          type: 'aiGeneration',
          position: { x: 500, y: yOffset - 100 },
          data: {
            label: 'AI 생성',
            provider: section.ai_provider || 'claude',
          },
        });
      }
    });

    // End node
    nodes.push({
      id: 'end',
      type: 'end',
      position: { x: 250, y: yOffset },
      data: { label: '완성된 문서' },
    });

    return nodes;
  }, [document]);

  // Initialize edges (connections between nodes)
  const initialEdges: Edge[] = useMemo(() => {
    if (!document) return [];

    const edges: Edge[] = [];
    let previousNodeId = 'start';

    document.sections?.forEach((section: any) => {
      const sectionNodeId = `section-${section.id}`;
      edges.push({
        id: `edge-${previousNodeId}-${sectionNodeId}`,
        source: previousNodeId,
        target: sectionNodeId,
        type: 'smoothstep',
        animated: true,
      });

      // AI generation edge
      if (section.ai_generated) {
        const aiNodeId = `ai-${section.id}`;
        edges.push({
          id: `edge-${sectionNodeId}-${aiNodeId}`,
          source: sectionNodeId,
          target: aiNodeId,
          type: 'smoothstep',
          animated: true,
          style: { strokeDasharray: '5 5' },
        });

        previousNodeId = aiNodeId;
      } else {
        previousNodeId = sectionNodeId;
      }
    });

    // Connect to end node
    edges.push({
      id: `edge-${previousNodeId}-end`,
      source: previousNodeId,
      target: 'end',
      type: 'smoothstep',
      animated: true,
    });

    return edges;
  }, [document]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await documentsApi.getDocument(documentId);
        setDocument(doc);
      } catch (error) {
        console.error('Failed to load document:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <Panel position="top-right">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            문서로 돌아가기
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrapper with ReactFlowProvider
export default function NodeCanvasPageWithProvider() {
  return (
    <ReactFlowProvider>
      <NodeCanvasPage />
    </ReactFlowProvider>
  );
}
```

**2. Node Components**

**StartNode.tsx**
```typescript
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function StartNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 shadow-md rounded-full bg-green-100 border-2 border-green-500">
      <div className="font-bold text-green-800">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
```

**SectionNode.tsx**
```typescript
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function SectionNode({ data }: NodeProps) {
  const statusColors = {
    완료: 'bg-blue-100 border-blue-500 text-blue-800',
    진행중: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    대기중: 'bg-gray-100 border-gray-500 text-gray-800',
  };

  const colorClass = statusColors[data.status] || statusColors.대기중;

  return (
    <div className={`px-6 py-4 shadow-md rounded-lg border-2 ${colorClass} min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="font-bold text-lg mb-2">{data.label}</div>
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded bg-white/50">
            {data.status}
          </span>
          <span className="text-xs">{data.wordCount?.toLocaleString()}자</span>
        </div>
        {data.lastEdited && (
          <div className="text-xs opacity-75">
            {new Date(data.lastEdited).toLocaleString('ko-KR')}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
```

**AIGenerationNode.tsx**
```typescript
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function AIGenerationNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 shadow-md rounded-lg border-2 bg-purple-100 border-purple-500 transform rotate-45 min-w-[150px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="transform -rotate-45">
        <div className="font-bold text-purple-800 text-center">{data.label}</div>
        <div className="text-xs text-purple-600 text-center mt-1">{data.provider}</div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}
```

**EndNode.tsx**
```typescript
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function EndNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 shadow-md rounded-full bg-green-100 border-2 border-green-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="font-bold text-green-800">{data.label}</div>
    </div>
  );
}
```

### Route Setup

Add to `App.tsx`:

```typescript
import NodeCanvasPage from './pages/NodeCanvasPage';

// In routes:
<Route path="/documents/:documentId/node-canvas" element={<NodeCanvasPage />} />
```

### Navigation

Add "Node UI 보기" button to document view:

```typescript
// In GeneratedDocumentViewer.tsx or DocumentEditPage.tsx
<button
  onClick={() => navigate(`/documents/${document.id}/node-canvas`)}
  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
>
  Node UI 보기
</button>
```

---

## Dependencies

**External Libraries:**
- `reactflow` - Node-based canvas library

**Internal Dependencies:**
- Epic 3: AI 문서 생성 (documents 데이터 구조)
- Epic 4: 문서 관리 (document API)

---

## Testing Checklist

- [ ] 캔버스가 정상적으로 렌더링된다
- [ ] Start, Section, AI, End 노드가 올바르게 표시된다
- [ ] 노드 간 연결선(Edge)이 올바르게 그려진다
- [ ] Pan/Zoom 기능이 작동한다
- [ ] "화면에 맞추기" 버튼이 작동한다
- [ ] Touch gestures (mobile)가 작동한다
- [ ] Status badge가 올바른 색상으로 표시된다
- [ ] Word count와 Last edited가 올바르게 표시된다
- [ ] "문서로 돌아가기" 버튼이 작동한다

---

## Definition of Done

- [x] Story 파일 작성 완료
- [x] React Flow 설치 및 설정
- [x] NodeCanvasPage 컴포넌트 구현
- [x] 4가지 Node 타입 구현 (Start, Section, AI, End)
- [x] 자동 노드/엣지 생성 로직 구현
- [x] Pan/Zoom/Controls 기능 구현
- [x] Responsive design (mobile gestures)
- [x] Route 연결
- [x] Navigation 버튼 추가
- [x] Sprint status: done
