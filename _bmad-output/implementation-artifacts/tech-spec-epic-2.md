# Technical Specification: Epic 2 - 무한 캔버스 탐색

**Epic ID:** Epic-2
**Epic Name:** 무한 캔버스 탐색 (Canvas Core Experience)
**Status:** Ready for Development
**Last Updated:** 2026-01-28
**Author:** Technical Specification (YOLO Mode)

---

## 1. Overview

### 1.1 Problem Statement

**User Pain Points:**
- 빈 캔버스에서 시작하는 방법을 모름
- 노드 생성/이동/연결 방법이 직관적이지 않음
- 모바일에서 터치 기반 노드 조작이 어려움

### 1.2 Solution Approach

**Core Capabilities:**
1. **7단계 노드 타입 시스템:** 문제 발굴, 문제 정의, 고객 개발, 시장 개발, 솔루션, 비즈니스 모델 캔버스, IR 자료
2. **노드 생성:** 더블클릭으로 빠르게 생성 (500ms)
3. **노드 이동:** 드래그 앤 드롭 (100ms 응답)
4. **노드 연결:** Shift+드래그로 화살표 연결 (100ms 렌더링)
5. **모바일 지원:** 터치 drag & drop (150ms), 핀치 줌

### 1.3 In/Out Scope

**In Scope (MVP):**
- React Flow 기반 무한 캔버스
- 7단계 노드 타입 정의 (Story 2.1)
- 더블클릭 노드 생성 (Story 2.2)
- 드래그 앤 드롭 이동 (Story 2.3)
- Shift+드래그 연결 (Story 2.4)
- Progressive Disclosure (처음엔 3단계만 표시)

**Out Scope (Post-MVP):**
- 실시간 협업 (멀티플레이어 커서)
- 고급 노드 커스터마이징
- 캔버스 템플릿 마켓플레이스

---

## 2. Context for Development

### 2.1 Existing Codebase Patterns

**Frontend Structure:**
```
frontend/src/
├── components/
│   └── node-canvas/
│       ├── SectionNodeEnhanced.tsx (existing)
│       ├── CustomEdge.tsx (existing)
│       ├── AnimatedEdge.tsx (existing)
│       ├── (NEW) LeanStartupNode.tsx
│       ├── (NEW) NodeTypeSelector.tsx
│       └── (NEW) CanvasControls.tsx
├── config/
│   └── (NEW) nodeTypes.ts
├── hooks/
│   └── (NEW) useCanvasInteraction.ts
├── pages/
│   └── (NEW) LeanStartupCanvasPage.tsx
└── store/
    └── slices/
        └── (NEW) canvasSlice.ts
```

**Backend Structure:**
```
backend/src/
├── routes/v1/
│   ├── canvas.routes.ts (existing)
│   └── nodes.routes.ts (existing)
└── services/
    └── (NEW) canvas.service.ts
```

**Technology Stack:**
- **Frontend:** React 19, React Flow 11.11.4, TypeScript 5.3, Tailwind CSS 3.4
- **Backend:** Express 4.19, TypeScript 5.3, pg 8.11.3 (PostgreSQL)
- **Database:** PostgreSQL 15 with pgvector 0.5.0

### 2.2 Files to Create/Modify

**New Files (Frontend):**
1. `/Users/donggyu/bm-builder/frontend/src/config/nodeTypes.ts`
2. `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/LeanStartupNode.tsx`
3. `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/NodeTypeSelector.tsx`
4. `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/CanvasControls.tsx`
5. `/Users/donggyu/bm-builder/frontend/src/hooks/useCanvasInteraction.ts`
6. `/Users/donggyu/bm-builder/frontend/src/store/slices/canvasSlice.ts`
7. `/Users/donggyu/bm-builder/frontend/src/pages/LeanStartupCanvasPage.tsx`

**Modified Files (Frontend):**
1. `/Users/donggyu/bm-builder/frontend/src/App.tsx` - Add route
2. `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/SectionNodeEnhanced.tsx` - Adapt for 7-stage

**New Files (Shared):**
1. `/Users/donggyu/bm-builder/shared/types/canvas.types.ts`

### 2.3 Technical Decisions from Architecture.md

**React Flow Configuration:**
- 무한 캔버스: `ReactFlow` + `Background` + `Controls` + `MiniMap`
- 노드 크기: 기본 200x150px
- 드래그 응답: 100ms 이내 (requestAnimationFrame)
- 줌 범위: 0.1x ~ 2x

**State Management:**
- Redux Toolkit for 캔버스 상태 (nodes, edges, viewport)
- React Flow 내부 상태와 동기화

**API Response Format:**
```typescript
type ApiResponse<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Performance Targets:**
- 노드 생성: 500ms 이내
- 드래그 응답: 100ms 이내
- 연결선 렌더링: 100ms 이내
- 60fps 부드러운 렌더링

---

## 3. Implementation Plan

### 3.1 Story 2.1: 7단계 노드 타입 시스템 구현

**Technical Tasks:**

**Frontend:**

1. **nodeTypes.ts Configuration**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/config/nodeTypes.ts`
   - 역할: 7단계 린스타트업 노드 타입 정의

   ```typescript
   export interface NodeType {
     id: string;
     label: string;
     stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
     color: string;
     visibleAtStage: number[];
     description: string;
     icon: string;
   }

   export const NODE_TYPES: NodeType[] = [
     {
       id: 'problem-discovery',
       label: '문제 발굴',
       stage: 1,
       color: '#ef4444', // red-500
       visibleAtStage: [1, 2, 3, 4, 5, 6, 7],
       description: '해결하고 싶은 문제를 발견하고 정의합니다',
       icon: '🔍'
     },
     {
       id: 'problem-definition',
       label: '문제 정의',
       stage: 2,
       color: '#f97316', // orange-500
       visibleAtStage: [2, 3, 4, 5, 6, 7],
       description: '고객의 관점에서 문제를 명확히 정의합니다',
       icon: '🎯'
     },
     {
       id: 'customer-development',
       label: '고객 개발',
       stage: 3,
       color: '#eab308', // yellow-500
       visibleAtStage: [3, 4, 5, 6, 7],
       description: '타겟 고객을 정의하고 인터뷰를 진행합니다',
       icon: '👥'
     },
     {
       id: 'market-development',
       label: '시장 개발',
       stage: 4,
       color: '#22c55e', // green-500
       visibleAtStage: [4, 5, 6, 7],
       description: 'TAM/SAM/SOM을 추정하고 경쟁사를 분석합니다',
       icon: '📈'
     },
     {
       id: 'solution',
       label: '솔루션',
       stage: 5,
       color: '#3b82f6', // blue-500
       visibleAtStage: [5, 6, 7],
       description: 'MVP 기능과 가치 제안을 정의합니다',
       icon: '💡'
     },
     {
       id: 'business-model-canvas',
       label: '비즈니스 모델 캔버스',
       stage: 6,
       color: '#6366f1', // indigo-500
       visibleAtStage: [6, 7],
       description: '9블록 캔버스로 비즈니스 모델을 구체화합니다',
       icon: '📊'
     },
     {
       id: 'pitch-deck',
       label: 'IR 자료',
       stage: 7,
       color: '#a855f7', // purple-500
       visibleAtStage: [7],
       description: '투자자용 피칭 덱을 준비합니다',
       icon: '📄'
     }
   ];

   // Progressive Disclosure helper
   export function getVisibleNodeTypes(
     completedStages: number[],
     showAll: boolean = false
   ): NodeType[] {
     if (showAll) return NODE_TYPES;

     const maxStage = Math.max(...completedStages, 0);
     return NODE_TYPES.filter(node =>
       node.visibleAtStage.includes(maxStage) || node.visibleAtStage.includes(maxStage + 1)
     );
   }
   ```

2. **LeanStartupNode Component**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/LeanStartupNode.tsx`
   - 역할: 7단계 노드 렌더링

   ```typescript
   import { Handle, Position, NodeProps } from 'reactflow';
   import { NODE_TYPES } from '../../config/nodeTypes';

   interface LeanStartupNodeData {
     type: string;
     label: string;
     content: string;
     status: 'not_started' | 'in_progress' | 'completed';
     stage: number;
   }

   export function LeanStartupNode({ data, selected }: NodeProps<LeanStartupNodeData>) {
     const nodeType = NODE_TYPES.find(nt => nt.id === data.type);

     return (
       <div
         className={`
           px-4 py-3 rounded-lg border-2 transition-all
           ${selected ? 'border-blue-500 shadow-lg' : 'border-transparent'}
         `}
         style={{
           backgroundColor: nodeType?.color,
           minWidth: 200,
           minHeight: 150
         }}
       >
         {/* Stage Number + Icon */}
         <div className="flex items-center gap-2 mb-2">
           <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
             Stage {nodeType?.stage}
           </span>
           <span className="text-xl">{nodeType?.icon}</span>
         </div>

         {/* Label */}
         <h3 className="font-bold text-white text-lg mb-2">
           {data.label}
         </h3>

         {/* Content Preview */}
         <p className="text-white/90 text-sm line-clamp-3">
           {data.content || '내용을 추가하세요...'}
         </p>

         {/* Status Icon */}
         <div className="absolute top-2 right-2 text-2xl">
           {data.status === 'not_started' && '⭕'}
           {data.status === 'in_progress' && '⏳'}
           {data.status === 'completed' && '✅'}
         </div>

         {/* Handles for connections */}
         <Handle type="target" position={Position.Top} />
         <Handle type="source" position={Position.Bottom} />
       </div>
     );
   }
   ```

3. **NodeTypeSelector Component**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/NodeTypeSelector.tsx`
   - 역할: 노드 타입 선택 모달

   ```typescript
   import { useState } from 'react';
   import { getVisibleNodeTypes } from '../../config/nodeTypes';
   import { useAppSelector } from '../../store/hooks';

   interface NodeTypeSelectorProps {
     onSelect: (typeId: string) => void;
     onClose: () => void;
     position: { x: number; y: number };
   }

   export function NodeTypeSelector({ onSelect, onClose, position }: NodeTypeSelectorProps) {
     const { completedStages, showAllStages } = useAppSelector(state => state.onboarding);
     const visibleTypes = getVisibleNodeTypes(completedStages, showAllStages);

     return (
       <div
         className="fixed z-[1000] bg-black/50 flex items-center justify-center"
         style={{ left: 0, top: 0, right: 0, bottom: 0 }}
       >
         <div
           className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full"
           style={{ maxHeight: '80vh', overflowY: 'auto' }}
         >
           <h2 className="text-2xl font-bold mb-4">노드 타입 선택</h2>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {visibleTypes.map(nodeType => (
               <button
                 key={nodeType.id}
                 onClick={() => onSelect(nodeType.id)}
                 className={`
                   p-4 rounded-lg border-2 transition-all
                   hover:shadow-lg hover:scale-105
                   bg-white
                 `}
                 style={{
                   borderColor: nodeType.color,
                   borderWidth: '2px'
                 }}
               >
                 <div className="text-3xl mb-2">{nodeType.icon}</div>
                 <div className="font-bold" style={{ color: nodeType.color }}>
                   {nodeType.label}
                 </div>
                 <div className="text-sm text-gray-600 mt-1">
                   {nodeType.description}
                 </div>
               </button>
             ))}
           </div>

           <button
             onClick={onClose}
             className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded"
           >
             취소
           </button>
         </div>
       </div>
     );
   }
   ```

**Backend:**

1. **canvas.service.ts**
   - 파일: `/Users/donggyu/bm-builder/backend/src/services/canvas.service.ts`
   - 기능: 노드/연결선 CRUD

   ```typescript
   import { pool } from '../utils/db';

   export async function createNode(userId: string, nodeData: any) {
     const query = `
       INSERT INTO nodes (user_id, type, x, y, content, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *
     `;
     const result = await pool.query(query, [
       userId,
       nodeData.type,
       nodeData.x,
       nodeData.y,
       nodeData.content || '',
       'not_started'
     ]);
     return result.rows[0];
   }

   export async function updateNode(userId: string, nodeId: string, updates: any) {
     const query = `
       UPDATE nodes
       SET x = $1, y = $2, content = $3, status = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *
     `;
     const result = await pool.query(query, [
       updates.x,
       updates.y,
       updates.content,
       updates.status,
       nodeId,
       userId
     ]);
     return result.rows[0];
   }
   ```

**Database Schema:**

```sql
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nodes_user_id ON nodes(user_id);
```

---

### 3.2 Story 2.2: 노드 생성 (더블클릭)

**Technical Tasks:**

**Frontend:**

1. **LeanStartupCanvasPage Component**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/pages/LeanStartupCanvasPage.tsx`
   - 역할: 메인 캔버스 페이지

   ```typescript
   import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
   import { LeanStartupNode } from '../components/node-canvas/LeanStartupNode';
   import { NodeTypeSelector } from '../components/node-canvas/NodeTypeSelector';
   import { useCanvasInteraction } from '../hooks/useCanvasInteraction';

   const nodeTypes = {
     'lean-startup': LeanStartupNode
   };

   export function LeanStartupCanvasPage() {
     const [nodes, setNodes, onNodesChange] = useNodesState([]);
     const [edges, setEdges, onEdgesChange] = useEdgesState([]);
     const {
       showNodeTypeSelector,
       selectorPosition,
       handleDoubleClick,
       handleNodeTypeSelect,
       handleCloseSelector
     } = useCanvasInteraction(setNodes);

     return (
       <div className="w-full h-screen">
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           nodeTypes={nodeTypes}
           onPaneClick={handleDoubleClick}
           fitView
         >
           <Background />
           <Controls />
           <MiniMap />
         </ReactFlow>

         {showNodeTypeSelector && (
           <NodeTypeSelector
             onSelect={handleNodeTypeSelect}
             onClose={handleCloseSelector}
             position={selectorPosition}
           />
         )}
       </div>
     );
   }
   ```

2. **useCanvasInteraction Hook**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/hooks/useCanvasInteraction.ts`
   - 역할: 캔버스 인터랙션 로직

   ```typescript
   import { useState, useCallback } from 'react';
   import { Connection, Edge, Node, addEdge } from 'reactflow';

   export function useCanvasInteraction(setNodes: React.Dispatch<React.SetStateAction<Node[]>>) {
     const [showNodeTypeSelector, setShowNodeTypeSelector] = useState(false);
     const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
     const [lastClickTime, setLastClickTime] = useState(0);
     const [lastClickPosition, setLastClickPosition] = useState({ x: 0, y: 0 });

     const handleDoubleClick = useCallback((event: React.MouseEvent) => {
       const currentTime = Date.now();
       const timeDiff = currentTime - lastClickTime;
       const positionDiff = Math.sqrt(
         Math.pow(event.clientX - lastClickPosition.x, 2) +
         Math.pow(event.clientY - lastClickPosition.y, 2)
       );

       // 300ms timeout 내 같은 위치 클릭 감지
       if (timeDiff < 300 && positionDiff < 10) {
         setShowNodeTypeSelector(true);
         setSelectorPosition({ x: event.clientX, y: event.clientY });
       }

       setLastClickTime(currentTime);
       setLastClickPosition({ x: event.clientX, y: event.clientY });
     }, [lastClickTime, lastClickPosition]);

     const handleNodeTypeSelect = useCallback((typeId: string) => {
       const newNode: Node = {
         id: `node-${Date.now()}`,
         type: 'lean-startup',
         position: {
           x: selectorPosition.x - 100, // Center the node
           y: selectorPosition.y - 75
         },
         data: {
           type: typeId,
           label: NODE_TYPES.find(nt => nt.id === typeId)?.label,
           content: '',
           status: 'not_started',
           stage: NODE_TYPES.find(nt => nt.id === typeId)?.stage
         }
       };

       setNodes(prevNodes => [...prevNodes, newNode]);
       setShowNodeTypeSelector(false);
     }, [selectorPosition, setNodes]);

     const handleCloseSelector = useCallback(() => {
       setShowNodeTypeSelector(false);
     }, []);

     return {
       showNodeTypeSelector,
       selectorPosition,
       handleDoubleClick,
       handleNodeTypeSelect,
       handleCloseSelector
     };
   }
   ```

**Performance Optimization:**
- React Flow 내부 최적화: `useNodesState`, `useEdgesState`
- 노드 렌더링: React.memo로 감싸서 불필요한 리렌더링 방지
- 더블클릭 감지: 300ms timeout + 위치 비교 (10px 이내)

---

### 3.3 Story 2.3: 노드 드래그 앤 드롭 이동

**Technical Tasks:**

**Frontend:**

1. **React Flow Draggable Configuration**
   - React Flow 기본 draggable 기능 활용
   - `onNodeDrag` 이벤트로 실시간 위치 업데이트

   ```typescript
   import ReactFlow, { useNodesState } from 'reactflow';

   export function LeanStartupCanvasPage() {
     const [nodes, setNodes, onNodesChange] = useNodesState([]);

     const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
       // 100ms 응답 목표 (React Flow 기본 최적화)
       console.log('Node dragging:', node.position);

       // 드래그 중 시각적 피드백
       setNodes(prevNodes =>
         prevNodes.map(n =>
           n.id === node.id
             ? { ...n, style: { ...n.style, opacity: 0.7 } }
             : n
         )
       );
     }, [setNodes]);

     const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
       // 드래그 종료 후 저장 (debounce 300ms)
       saveNodePosition(node.id, node.position);

       // 투명도 복원
       setNodes(prevNodes =>
         prevNodes.map(n =>
           n.id === node.id
             ? { ...n, style: { ...n.style, opacity: 1 } }
             : n
         )
       );
     }, [setNodes]);

     return (
       <ReactFlow
         nodes={nodes}
         onNodesChange={onNodesChange}
         onNodeDrag={handleNodeDrag}
         onNodeDragStop={handleNodeDragStop}
         // ... other props
       />
     );
   }
   ```

2. **다중 선택 및 드래그**
   - Shift+클릭으로 다중 선택
   - 선택된 노드들 함께 이동

   ```typescript
   const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

   const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
     if (event.shiftKey) {
       setSelectedNodes(prev =>
         prev.includes(node.id)
           ? prev.filter(id => id !== node.id)
           : [...prev, node.id]
       );
     } else {
       setSelectedNodes([node.id]);
     }
   }, []);
   ```

**Performance Optimization:**
- `requestAnimationFrame` 사용하여 60fps 유지
- Debounce 300ms 후 서버 API 호출
- Optimistic Update: UI 먼저 업데이트, 서버 저장은 비동기

---

### 3.4 Story 2.4: 노드 연결 (Shift+드래그)

**Technical Tasks:**

**Frontend:**

1. **연결 모드 활성화**
   - Shift 키 감지
   - 앵커 포인트(6px 원형) 표시

   ```typescript
   import { useState, useCallback } from 'react';
   import { ReactFlowProvider, useReactFlow } from 'reactflow';

   export function CanvasConnections() {
     const [isShiftPressed, setIsShiftPressed] = useState(false);
     const { setEdges } = useReactFlow();

     useEffect(() => {
       const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Shift') setIsShiftPressed(true);
       };
       const handleKeyUp = (e: KeyboardEvent) => {
         if (e.key === 'Shift') setIsShiftPressed(false);
       };

       window.addEventListener('keydown', handleKeyDown);
       window.addEventListener('keyup', handleKeyUp);

       return () => {
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
       };
     }, []);

     const onConnect = useCallback((connection: Connection) => {
       const newEdge: Edge = {
         id: `edge-${Date.now()}`,
         source: connection.source!,
         target: connection.target!,
         type: 'smoothstep', // Bezier 곡선
         animated: true,
         style: { stroke: '#9ca3af', strokeWidth: 2 },
         markerEnd: {
           type: 'arrowclosed',
           color: '#9ca3af'
         }
       };

       setEdges(prevEdges => addEdge(newEdge, prevEdges));
       saveConnection(newEdge);
     }, [setEdges]);

     return (
       <ReactFlow
         onConnect={onConnect}
         connectOnClick={false}
         // ... other props
       >
         {/* Custom Handle with anchor points */}
         <LeanStartupNode isShiftPressed={isShiftPressed} />
       </ReactFlow>
     );
   }
   ```

2. **Custom Edge Component**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/CustomEdge.tsx` (기존 파일 활용)
   - Bezier 곡선 + 화살표

   ```typescript
   import { EdgeProps, getBezierPath } from 'reactflow';

   export function CustomEdge({
     id,
     sourceX,
     sourceY,
     targetX,
     targetY,
     sourcePosition,
     targetPosition,
     style = {}
   }: EdgeProps) {
     const [edgePath] = getBezierPath({
       sourceX,
       sourceY,
       sourcePosition,
       targetX,
       targetY,
       targetPosition
     });

     return (
       <>
         <path
           id={id}
           style={style}
           className="fill-none stroke-gray-400 stroke-2"
           d={edgePath}
         />
         <defs>
           <marker
             id={`arrow-${id}`}
             markerWidth="10"
             markerHeight="10"
             refX="9"
             refY="3"
             orient="auto"
             markerUnits="strokeWidth"
           >
             <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
           </marker>
         </defs>
       </>
     );
   }
   ```

**Backend:**

1. **연결선 저장 API**
   - 엔드포인트: `POST /api/v1/canvas/connections`

   ```typescript
   export async function createConnection(userId: string, connection: any) {
     const query = `
       INSERT INTO connections (user_id, source_node_id, target_node_id, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *
     `;
     const result = await pool.query(query, [
       userId,
       connection.source,
       connection.target
     ]);
     return result.rows[0];
   }
   ```

**Database Schema:**

```sql
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id)
);

CREATE INDEX idx_connections_user_id ON connections(user_id);
```

---

## 4. Acceptance Criteria

### Story 2.1: 7단계 노드 타입 시스템 구현

**AC 2.1.1:** Given 시스템이 초기화된다, When 노드 타입 설정을 로드한다, Then `src/config/nodeTypes.ts` 파일에서 7단계 노드 타입이 정의된다

**Technical Validation:**
- File exists: `/Users/donggyu/bm-builder/frontend/src/config/nodeTypes.ts`
- Export: `export const NODE_TYPES: NodeType[]`
- Length: `NODE_TYPES.length === 7`

**AC 2.1.2:** Given 사용자가 빈 캔버스를 더블클릭한다, When 노드 생성 모달이 표시된다, Then 7가지 노드 타입이 카드 형태로 표시된다

**Technical Validation:**
- React Component: `<NodeTypeSelector>` renders 7 cards
- Each card has: icon, label, description, color

**AC 2.1.3:** Given Progressive Disclosure가 적용된다, When 사용자가 처음 캔버스에 진입한다, Then 처음엔 Stage 1-3 노드 타입만 표시된다

**Technical Validation:**
- Function: `getVisibleNodeTypes([1, 2, 3], false)`
- Returns: 3 node types (Stage 1, 2, 3)

---

### Story 2.2: 노드 생성 (더블클릭)

**AC 2.2.1:** Given 사용자가 빈 캔버스 영역을 더블클릭한다, When 더블클릭이 감지된다, Then 300ms timeout 내 두 번의 클릭이 감지되어야 한다

**Technical Validation:**
- Hook: `useCanvasInteraction`
- Logic: `timeDiff < 300 && positionDiff < 10`

**AC 2.2.2:** Given 사용자가 노드 타입을 선택한다, When 타입 카드를 클릭한다, Then 500ms 이내에 새 노드가 생성된다

**Technical Validation:**
- Performance: `performance.now() - startTime < 500`
- React Flow: `addNodes()` API

---

### Story 2.3: 노드 드래그 앤 드롭 이동

**AC 2.3.1:** Given 사용자가 노드를 클릭한다, When 마우스 버튼을 누른 상태로 이동한다, Then 100ms 이내에 드래그가 시작된다

**Technical Validation:**
- React Flow `onNodeDrag` event
- Response time: < 100ms

**AC 2.3.2:** Given 드래그가 진행 중이다, When 노드를 이동한다, Then 60fps로 부드럽게 렌더링된다

**Technical Validation:**
- FPS measurement: `requestAnimationFrame`
- Target: >= 60fps

---

### Story 2.4: 노드 연결 (Shift+드래그)

**AC 2.4.1:** Given 사용자가 Shift 키를 누르고 노드를 드래그한다, When 연결 모드가 활성화된다, Then 노드 4면에 앵커 포인트(6px 원형)가 표시된다

**Technical Validation:**
- Event: `window.addEventListener('keydown', ...)` 감지 'Shift'
- Visual: 4 circular handles (top, bottom, left, right)

**AC 2.4.2:** Given 연결 모드에서 앵커 포인트를 클릭한다, When 다른 노드의 앵커 포인트로 드래그한다, Then 연결선이 100ms 이내에 렌더링된다

**Technical Validation:**
- React Flow `onConnect` event
- Render time: < 100ms

---

## 5. Performance Targets

**NFR-002:** 노드 생성 500ms 이내
- 측정: `performance.now()`
- target: < 500ms

**NFR-008:** 키보드 단축키 지원
- Ctrl+Z: 실행 취소
- Del: 삭제
- Shift+드래그: 연결 모드

**NFR-009:** 모바일 반응형
- 터치 drag & drop: 150ms 내 응답
- 핀치 줌 지원
- 320px-1920px 브레이크포인트

**NFR-010:** WCAG 2.1 AA 준수
- 대비율 4.5:1 (모든 노드 타입 색상)
- 키보드 내비게이션
- 초점 표시

---

## 6. Additional Context

### 6.1 Dependencies

**External Libraries:**
- `reactflow@11.11.4` (existing): 캔버스 라이브러리
- `@dnd-kit/core@6.1.0` (existing): 드래그 앤 드롭 (React Flow 내장)

**Internal Dependencies:**
- Epic 1: 온보딩 완료 후 캔버스 진입
- Epic 3: 7단계 여정 진행 상태 시각화

### 6.2 Testing Strategy

**Unit Tests (Vitest):**
- `nodeTypes.test.ts`: 7단계 타입 정의 확인
- `useCanvasInteraction.test.ts`: 더블클릭 감지, 노드 생성
- `LeanStartupNode.test.tsx`: 노드 렌더링

**Integration Tests:**
- 노드 생성 → 이동 → 연결 플로우
- Progressive Disclosure: 3단계 → 7단계 확장

**Performance Tests:**
- 노드 100개 생성 시 렌더링 성능
- 드래그 응답 시간 측정

### 6.3 Notes

**Critical Path:**
1. `nodeTypes.ts` 정의
2. `LeanStartupNode` 컴포넌트
3. `LeanStartupCanvasPage` 메인 캔버스
4. `useCanvasInteraction` 인터랙션 로직
5. React Flow configuration

**Risks:**
- React Flow 성능 저하 (노드 100개 이상) → Virtualization 고려
- 모바일 터치 이슈 → Touch event handlers 별도 구현
- Progressive Disclosure 사용자 혼란 → 명확한 UI 가이드 필요

**Mitigation:**
- React.memo로 노드 컴포넌트 최적화
- Mobile 별도 event listeners (touchstart, touchmove, touchend)
- "Stage 4 이상 타입은 이전 단계 완성 후 해제됩니다" 안내 메시지

---

**Tech-spec-epic-2.md - Ready for Development** ✅
