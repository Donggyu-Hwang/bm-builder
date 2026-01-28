import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  NodeProps,
  ReactFlowJsonObject,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addNode, updateNode, addEdge as addEdgeAction } from '../../store/canvasSlice';
import { getNodeTypeById, INITIAL_NODE_TYPES } from '../../config/nodeTypes';
import NodeTypeSelector from './NodeTypeSelector';
import { CanvasStorageService } from '../../services/canvasStorage.service';
import CustomNode, { CustomNodeData } from './CustomNode';

interface LeanStartupCanvasProps {
  onNodeDoubleClick?: (nodeId: string) => void;
}

const LeanStartupCanvas: React.FC<LeanStartupCanvasProps> = ({ onNodeDoubleClick }) => {
  const dispatch = useAppDispatch();
  const { progressiveDisclosure } = useAppSelector((state) => state.canvas);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isNodeTypeModalOpen, setIsNodeTypeModalOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define custom node types
  const nodeTypes: NodeTypes = React.useMemo(
    () => ({
      custom: (props: NodeProps<CustomNodeData>) => <CustomNode {...props} />,
    }),
    []
  );

  // Get available node types based on progressive disclosure
  const availableNodeTypes = progressiveDisclosure.showAll
    ? INITIAL_NODE_TYPES
    : INITIAL_NODE_TYPES.filter((type) =>
        progressiveDisclosure.unlockedStages.includes(type.stage)
      );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'smoothstep' as const,
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      dispatch(addEdgeAction(newEdge));
    },
    [dispatch, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      dispatch(updateNode(node));
      // Trigger auto-save
      triggerAutoSave();
    },
    [dispatch, nodes]
  );

  // Auto-save every 10 seconds (Story 5.1)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      CanvasStorageService.saveCanvas(nodes, edges);
      setLastSaved(new Date());

      // Sync with server if online (Story 5.2)
      if (CanvasStorageService.isOnline()) {
        CanvasStorageService.syncWithServer(nodes, edges);
      }
    }, 10000);
  }, [nodes, edges]);

  // Trigger auto-save when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      triggerAutoSave();
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [nodes, edges, triggerAutoSave]);

  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    const reactFlowBounds = (event.target as HTMLElement)
      .closest('.react-flow')
      ?.getBoundingClientRect();

    if (!reactFlowBounds) return;

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    setPendingPosition(position);
    setIsNodeTypeModalOpen(true);
  }, []);

  const handleNodeTypeSelect = useCallback(
    (nodeTypeId: string) => {
      if (!pendingPosition) return;

      const nodeType = getNodeTypeById(nodeTypeId);
      if (!nodeType) return;

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: pendingPosition,
        data: {
          label: nodeType.label,
          stage: nodeType.stage,
          color: nodeType.color,
          icon: nodeType.icon,
          description: nodeType.description,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      dispatch(addNode(newNode));
      setIsNodeTypeModalOpen(false);
      setPendingPosition(null);
    },
    [pendingPosition, dispatch, setNodes]
  );

  const handleModalClose = useCallback(() => {
    setIsNodeTypeModalOpen(false);
    setPendingPosition(null);
  }, []);

  // Load canvas from localStorage on mount
  useEffect(() => {
    const savedCanvas = CanvasStorageService.loadCanvas();
    if (savedCanvas) {
      setNodes(savedCanvas.nodes);
      setEdges(savedCanvas.edges);
    }
  }, [setNodes, setEdges]);

  // Listen for online/offline events (Story 5.2)
  useEffect(() => {
    const handleOnline = () => {
      if (nodes.length > 0 || edges.length > 0) {
        CanvasStorageService.syncWithServer(nodes, edges);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [nodes, edges]);

  return (
    <div className="w-full h-screen relative" onDoubleClick={onPaneDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={(_event, node) => onNodeDoubleClick?.(node.id)}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const color = (node.data as { color?: string })?.color;
            return color || '#94a3b8';
          }}
          className="!bg-white dark:!bg-gray-800"
        />
      </ReactFlow>

      {isNodeTypeModalOpen && (
        <NodeTypeSelector
          nodeTypes={availableNodeTypes}
          onSelect={handleNodeTypeSelect}
          onClose={handleModalClose}
        />
      )}

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-lg text-sm">
          저장됨 {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Help hint */}
      <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">더블클릭</span>하여 노드 생성
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shift+드래그로 노드 연결</p>
      </div>
    </div>
  );
};

export default LeanStartupCanvas;
