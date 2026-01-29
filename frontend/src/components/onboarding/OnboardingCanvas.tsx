import React, { useState, useEffect } from 'react';
import type { OnboardingMode } from '../../types/canvas';
import { useAppDispatch } from '../../store/hooks';
import { AIGuideToggle } from './AIGuideToggle';
import { OnboardingModeBadge } from './OnboardingModeBadge';
import { ProblemDiscovery } from './ProblemDiscovery';
import { AIQuestionMode } from './AIQuestionMode';
import { NodeTypeSelector } from './NodeTypeSelector';
import { NodeTypeModal } from '../canvas/NodeTypeModal';
import { NodeCreationHint } from './NodeCreationHint';
import { CelebrationModal } from './CelebrationModal';
import { NextStepsCard } from './NextStepsCard';
import { AutoTransitionModal } from './AutoTransitionModal';
import { NodeDetailSidebar } from './NodeDetailSidebar';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useNodeCompletion } from '../../hooks/useNodeCompletion';
import { useDoubleClick } from '../../hooks/useDoubleClick';
import { useLongPress } from '../../hooks/useLongPress';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import { useDragHistory } from '../../hooks/useDragHistory';
import { useConnection } from '../../hooks/useConnection';
import { calculateNodePosition } from '../../utils/layout';
import { transitionToMainCanvas } from '../../store/slices/onboardingSlice';
import type { NodeType } from '../../config/nodeTypes';
import { DraggableNode } from './DraggableNode';
import { ConnectionLine } from '../canvas/ConnectionLine';
import { AnchorPoint } from '../canvas/AnchorPoint';
import { updateNodePosition } from '../../api/nodesApi';
import { createConnection, deleteConnection as deleteConnectionApi } from '../../api/connectionsApi';
import type { Connection } from '../../types/connection';

interface OnboardingCanvasProps {
  mode: OnboardingMode;
}

interface Node {
  id: string;
  type: string;
  stage: number;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export const OnboardingCanvas: React.FC<OnboardingCanvasProps> = ({ mode }) => {
  // Redux dispatch
  const dispatch = useAppDispatch();

  // Network status hook
  const { isOffline } = useNetworkStatus();

  const [aiGuideEnabled, setAiGuideEnabled] = useState(true);
  const [nodeCount, setNodeCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showTeamInvite, setShowTeamInvite] = useState(false);

  // Story 1.3: AI Question Mode states
  const [showAIQuestion, setShowAIQuestion] = useState(false);
  const [aiQuestionStarted, setAiQuestionStarted] = useState(false);
  const [showNodeTypeSelector, setShowNodeTypeSelector] = useState(false);
  const [showNodeCreationHint, setShowNodeCreationHint] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Story 2.2: Track double-click coordinates
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  // Story 2.3: Multi-select state
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Story 2.4: Connection state
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Story 2.3: Drag history for undo/redo
  const {
    addToHistory,
    undo: undoDrag,
    redo: redoDrag,
    canUndo,
    canRedo,
  } = useDragHistory({
    maxSize: 10,
    onUndo: (entry) => {
      // Restore node position
      setNodes((prev) =>
        prev.map((node) =>
          node.id === entry.nodeId
            ? { ...node, x: entry.fromPosition.x, y: entry.fromPosition.y, updatedAt: Date.now() }
            : node
        )
      );
    },
    onRedo: (entry) => {
      // Restore node position
      setNodes((prev) =>
        prev.map((node) =>
          node.id === entry.nodeId
            ? { ...node, x: entry.toPosition.x, y: entry.toPosition.y, updatedAt: Date.now() }
            : node
        )
      );
    },
  });

  // Story 2.3: Drag hook with visual feedback
  const [dragState, dragHandlers] = useNodeDrag({
    onDragStart: (nodeId) => {
      console.log('[Story 2.3] Drag started:', nodeId);
    },
    onDragMove: (nodeId, position) => {
      // Update node position
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, x: position.x, y: position.y, updatedAt: Date.now() } : node
        )
      );
    },
    onDragEnd: async (nodeId, position) => {
      console.log('[Story 2.3] Drag ended:', nodeId, position);

      // Find original position for history
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        // Add to history for undo/redo
        addToHistory({
          nodeId,
          fromPosition: { x: node.x, y: node.y },
          toPosition: position,
          timestamp: Date.now(),
        });
      }

      // Story 2.3 AC: debounce 300ms 후 서버 API가 호출된다
      // Debounce API call and show success toast
      setTimeout(async () => {
        try {
          await updateNodePosition(nodeId, position);
          setToastMessage('저장됨');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1000);
        } catch (error) {
          // Story 2.3: 오프라인 상태에서 노드를 이동한다
          // If API fails, save to LocalStorage for offline sync
          console.log('[Story 2.3] API call failed, saving to LocalStorage for sync');
          setToastMessage('오프라인: 위치가 저장되었습니다 (동기화 대기중)');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);

          // Save to LocalStorage with sync queue marker
          const syncQueue = JSON.parse(localStorage.getItem('bm_builder_sync_queue') || '[]');
          syncQueue.push({
            action: 'UPDATE_NODE_POSITION',
            nodeId,
            position,
            timestamp: Date.now(),
          });
          localStorage.setItem('bm_builder_sync_queue', JSON.stringify(syncQueue));
        }
      }, 300);
    },
    selectedNodeIds,
    onMultiDragMove: (nodeIds, delta) => {
      // Update all selected nodes
      setNodes((prev) =>
        prev.map((node) =>
          nodeIds.includes(node.id)
            ? { ...node, x: node.x + delta.dx, y: node.y + delta.dy, updatedAt: Date.now() }
            : node
        )
      );
    },
    canvasBounds: { width: 2000, height: 2000 },
    nodes,
  });

  // Story 2.4: Connection hook with Shift+drag
  const {
    connections,
    pendingConnection,
    visibleAnchors,
    isConnectionMode,
    hoveredAnchor,
    startConnectionDrag,
    updateConnectionDrag,
    completeConnectionDrag,
    cancelConnectionDrag,
    deleteConnection,
    activateConnectionMode,
    deactivateConnectionMode,
    setHoveredAnchor,
    updateNodeAnchors,
    removeNodeAnchors,
    validateConnection,
    calculateAnchorPoints,
    findNearestAnchor,
  } = useConnection({
    onConnectionCreate: async (connection) => {
      console.log('[Story 2.4] Connection created:', connection);

      // Call API to persist connection
      try {
        await createConnection({
          sourceNodeId: connection.sourceNodeId,
          targetNodeId: connection.targetNodeId,
          sourceAnchor: connection.sourceAnchor,
          targetAnchor: connection.targetAnchor,
        });
        setToastMessage('연결됨');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1000);
      } catch (error) {
        console.error('[Story 2.4] Failed to save connection:', error);
        setToastMessage('오프라인: 연결이 저장되었습니다 (동기화 대기중)');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    },
    onConnectionDelete: async (connectionId) => {
      console.log('[Story 2.4] Connection deleted:', connectionId);

      // Call API to delete connection
      try {
        await deleteConnectionApi(connectionId);
        setToastMessage('연결 삭제됨');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1000);
      } catch (error) {
        console.error('[Story 2.4] Failed to delete connection:', error);
      }
    },
    onValidationError: (errorMessage) => {
      console.log('[Story 2.4] Validation error:', errorMessage);
      setToastMessage(errorMessage);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    },
    canvasBounds: { width: 2000, height: 2000 },
  });

  // Story 2.4: Update anchor points when nodes change
  useEffect(() => {
    nodes.forEach((node) => {
      updateNodeAnchors(
        node.id,
        node.x,
        node.y,
        node.width || 200,
        node.height || 150
      );
    });

    // Clean up anchors for deleted nodes
    const currentNodeIds = new Set(nodes.map((n) => n.id));
    visibleAnchors.forEach((_, nodeId) => {
      if (!currentNodeIds.has(nodeId)) {
        removeNodeAnchors(nodeId);
      }
    });
  }, [nodes, updateNodeAnchors, removeNodeAnchors, visibleAnchors]);

  // Story 2.4: Keyboard shortcuts for connection mode (Shift key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        activateConnectionMode();
      }
      // DEL key to delete selected connection
      if (e.key === 'Delete' && selectedConnectionId) {
        deleteConnection(selectedConnectionId);
        setSelectedConnectionId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        deactivateConnectionMode();
        cancelConnectionDrag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    activateConnectionMode,
    deactivateConnectionMode,
    cancelConnectionDrag,
    selectedConnectionId,
    deleteConnection,
  ]);

  // Story 2.2: Double-click detection
  const { handleClick: handleDoubleClick, getClickCoordinates } = useDoubleClick({
    delay: 300,
    onDoubleClick: () => {
      const coords = getClickCoordinates();
      if (coords && showNodeCreationHint) {
        setClickPosition(coords);
        setShowNodeTypeSelector(true);
      }
    },
  });

  // Story 2.2: Mobile long press detection
  const { handlers: longPressHandlers, isPressed: isLongPressed } = useLongPress({
    delay: 500,
    onLongPress: () => {
      if (showNodeCreationHint) {
        setShowNodeTypeSelector(true);
      }
    },
  });

  // Story 1.4: Completion celebration and next steps
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showNextStepsCard, setShowNextStepsCard] = useState(false);
  const [showViewNextStepsButton, setShowViewNextStepsButton] = useState(false);
  const [showAutoTransitionModal, setShowAutoTransitionModal] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Use node completion hook
  useNodeCompletion(
    nodes,
    {
      minContentLength: 100,
      onFirstCompletion: () => {
        setShowCelebrationModal(true);
      },
    }
  );

  // LocalStorage key for offline node storage
  const LOCAL_STORAGE_KEY = 'bm_builder_nodes';

  // Load nodes from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          setNodeCount(data.nodes.length);
        }
      }
    } catch (error) {
      console.error('Failed to load nodes from LocalStorage:', error);
    }
  }, []);

  // Save nodes to LocalStorage whenever they change
  useEffect(() => {
    try {
      const data = {
        nodes,
        timestamp: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save nodes to LocalStorage:', error);
    }
  }, [nodes]);

  // Auto-start AI question mode after 3 seconds for beginner mode
  useEffect(() => {
    if (mode === 'beginner' && !aiQuestionStarted) {
      const timer = setTimeout(() => {
        setShowAIQuestion(true);
        setAiQuestionStarted(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mode, aiQuestionStarted]);

  // Track node count and show completion modal at 3+ nodes
  useEffect(() => {
    if (nodeCount >= 3 && !onboardingCompleted) {
      setShowAutoTransitionModal(true);
    }
  }, [nodeCount, onboardingCompleted]);

  // Story 2.2: Keyboard accessibility - Enter key to create node
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showNodeCreationHint) {
        e.preventDefault();
        setShowNodeTypeSelector(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showNodeCreationHint]);

  // Story 2.3: Keyboard shortcuts for undo/redo (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undoDrag();
          setToastMessage('실행 취소됨');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1000);
        }
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) {
          redoDrag();
          setToastMessage('다시 실행됨');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1000);
        }
      }
      // Escape key to cancel drag
      if (e.key === 'Escape' && dragState.isDragging) {
        // Cancel drag and restore original position
        const draggedNode = nodes.find((n) => n.id === dragState.draggedNodeId);
        if (draggedNode && dragState.currentPosition) {
          setNodes((prev) =>
            prev.map((node) =>
              node.id === dragState.draggedNodeId
                ? { ...node, x: dragState.currentPosition!.x, y: dragState.currentPosition!.y }
                : node
            )
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, dragState.isDragging, dragState.draggedNodeId, dragState.currentPosition, nodes, undoDrag, redoDrag]);

  // Story 2.3: Handle node click for multi-select (Shift+click)
  const handleNodeClick = (nodeId: string) => {
    // Check if Shift key is pressed (via window event)
    const isShiftPressed = (window.event as any)?.shiftKey;

    if (isShiftPressed) {
      // Toggle selection
      setSelectedNodeIds((prev) =>
        prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
      );
    } else {
      // Single select
      setSelectedNodeIds([nodeId]);
    }

    setSelectedNodeId(nodeId);
  };

  const handleToggleAI = (enabled: boolean) => {
    setAiGuideEnabled(enabled);
  };

  const handleStartAIQuestion = () => {
    // Clear countdown and show question
    setAiQuestionStarted(true);
  };

  const handleSkipAIQuestion = () => {
    setShowAIQuestion(false);
    setShowNodeCreationHint(true);
  };

  const handleCreateNodeFromAI = (content: string) => {
    const now = Date.now();
    const newNode: Node = {
      id: `node-${now}`,
      type: '문제 발굴',
      stage: 1,
      content,
      x: 400,
      y: 300,
      status: 'not_started',
      createdAt: now,
      updatedAt: now,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setNodeCount((prev) => prev + 1);
    setShowAIQuestion(false);

    // Show success toast with offline notification if applicable
    if (isOffline) {
      setToastMessage('오프라인 모드: 노드가 로컬에 저장되었습니다');
    } else {
      setToastMessage('첫 번째 노드가 생성되었습니다! 이제 내용을 추가해보세요');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCanvasDoubleClick = () => {
    // Handled by useDoubleClick hook
  };

  // Story 2.2: Updated node type selection with auto-layout
  const handleNodeTypeSelect = (stage: number, nodeType: string) => {
    const now = Date.now();

    // Use click position or default center position
    const clickPos = clickPosition || { x: 400, y: 300 };

    // Calculate position to avoid collisions
    const adjustedPosition = calculateNodePosition(clickPos, nodes);

    const newNode: Node = {
      id: `node-${now}`,
      type: nodeType,
      stage,
      content: '',
      x: adjustedPosition.x,
      y: adjustedPosition.y,
      width: 200,
      height: 150,
      status: 'not_started',
      createdAt: now,
      updatedAt: now,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setNodeCount((prev) => prev + 1);
    setShowNodeTypeSelector(false);
    setClickPosition(null); // Reset click position

    // Show success toast with offline notification if applicable
    if (isOffline) {
      setToastMessage('오프라인 모드: 노드가 로컬에 저장되었습니다');
    } else {
      setToastMessage('노드가 생성되었습니다!');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Story 2.2: Updated node type selection from NodeTypeModal with auto-layout
  const handleNodeTypeModalSelect = (nodeType: NodeType) => {
    const now = Date.now();

    // Use click position or default center position
    const clickPos = clickPosition || { x: 400, y: 300 };

    // Calculate position to avoid collisions (Story 2.2)
    const adjustedPosition = calculateNodePosition(clickPos, nodes);

    const newNode: Node = {
      id: `node-${now}`,
      type: nodeType.label,
      stage: nodeType.stage,
      content: '',
      x: adjustedPosition.x,
      y: adjustedPosition.y,
      width: 200,
      height: 150,
      status: 'not_started',
      createdAt: now,
      updatedAt: now,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setNodeCount((prev) => prev + 1);
    setShowNodeTypeSelector(false);
    setClickPosition(null); // Reset click position

    // Show success toast with offline notification if applicable
    if (isOffline) {
      setToastMessage('오프라인 모드: 노드가 로컬에 저장되었습니다');
    } else {
      setToastMessage(`${nodeType.label} 노드가 생성되었습니다!`);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleContinueOnboarding = () => {
    setShowCompletionModal(false);
  };

  // Story 1.4: Celebration Modal Handlers
  const handleViewNextSteps = () => {
    setShowCelebrationModal(false);
    setShowNextStepsCard(true);
  };

  const handleContinueOnboardingFromCelebration = () => {
    setShowCelebrationModal(false);
  };

  const handleSwitchToMainFromCelebration = () => {
    setShowCelebrationModal(false);
    // Dispatch Redux action to transition to main canvas
    dispatch(transitionToMainCanvas());
    setOnboardingCompleted(true);
    // Show toast notification
    setToastMessage('메인 캔버스로 전환되었습니다');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000);
  };

  // Story 1.4: Next Steps Card Handlers
  const handleStartNextStep = () => {
    setShowNextStepsCard(false);
    setToastMessage('문제 정의 단계를 시작합니다');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLaterNextSteps = () => {
    setShowNextStepsCard(false);
    setShowViewNextStepsButton(true);
  };

  const handleViewNextStepsShortcut = () => {
    setShowNextStepsCard(true);
  };

  // Auto-transition handlers
  const handleCancelAutoTransition = () => {
    setShowAutoTransitionModal(false);
  };

  const handleExecuteAutoTransition = () => {
    setShowAutoTransitionModal(false);
    // Dispatch Redux action to transition to main canvas
    dispatch(transitionToMainCanvas());
    setOnboardingCompleted(true);
    setToastMessage('메인 캔버스로 전환되었습니다');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000);
  };

  const handleSwitchToMain = () => {
    // Dispatch Redux action to transition to main canvas
    dispatch(transitionToMainCanvas());
    setOnboardingCompleted(true);
    setToastMessage('메인 캔버스로 전환되었습니다');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Lean Startup Canvas
            </h1>
            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              AI Co-Founder와 함께 시작하기
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Story 1.4: View Next Steps Button (shown when user clicks "Later") */}
            {showViewNextStepsButton && (
              <button
                onClick={handleViewNextStepsShortcut}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                다음 단계 보기
              </button>
            )}

            {/* Team Invite Button (Team Mode) */}
            {mode === 'team' && (
              <button
                onClick={() => setShowTeamInvite(!showTeamInvite)}
                className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-900"
              >
                팀원 초대
              </button>
            )}

            {/* Start AI Guide Button (Experienced mode) */}
            {mode !== 'beginner' && !aiQuestionStarted && (
              <button
                onClick={() => setShowAIQuestion(true)}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                AI 가이드 시작
              </button>
            )}

            <OnboardingModeBadge mode={mode} />
            <AIGuideToggle enabled={aiGuideEnabled} onToggle={handleToggleAI} />
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* AI Guide Message */}
          {aiGuideEnabled && (
            <div className="mb-8 p-6 bg-white/90 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {mode === 'beginner' && '더블클릭하여 첫 번째 노드를 생성하세요'}
                    {mode === 'problem-discovery' && '왼쪽의 질문에 답변하여 아이디어를 구체화해보세요'}
                    {mode === 'team' && '팀원들과 함께 협업하며 아이디어를 발전시켜 보세요'}
                  </p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    진행률: {nodeCount}/3 노드 완성
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div
            className={`relative bg-white rounded-lg border-2 border-dashed border-gray-300 min-h-[600px] flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
              isLongPressed ? 'scale-95' : ''
            }`}
            onClick={handleDoubleClick}
            {...longPressHandlers}
          >
            {/* Keyboard Shortcuts Hint */}
            {nodes.length > 0 && (
              <div className="absolute top-4 left-4 px-3 py-2 bg-gray-900/5 backdrop-blur-sm border border-gray-300 rounded-lg text-xs">
                <p className="font-mono text-gray-600 mb-1">
                  <span className="font-bold">단축키:</span>
                </p>
                <div className="space-y-1">
                  <p><kbd className="px-1 bg-white border rounded">Ctrl+Z</kbd> 실행 취소</p>
                  <p><kbd className="px-1 bg-white border rounded">Ctrl+Shift+Z</kbd> 다시 실행</p>
                  <p><kbd className="px-1 bg-white border rounded">Shift+Click</kbd> 다중 선택</p>
                  <p><kbd className="px-1 bg-white border rounded">Shift+Drag</kbd> 노드 연결</p>
                  <p><kbd className="px-1 bg-white border rounded">Del</kbd> 연결 삭제</p>
                  <p><kbd className="px-1 bg-white border rounded">Esc</kbd> 드래그 취소</p>
                </div>
              </div>
            )}

            {/* Story 2.4: Render Connection Lines (below nodes at z-index 50) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 50 }}
            >
              {/* Completed connections */}
              {connections.map((connection) => {
                const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId);
                const targetNode = nodes.find((n) => n.id === connection.targetNodeId);

                if (!sourceNode || !targetNode) return null;

                // Get anchor positions
                const sourceAnchors = calculateAnchorPoints(
                  connection.sourceNodeId,
                  sourceNode.x,
                  sourceNode.y,
                  sourceNode.width || 200,
                  sourceNode.height || 150
                );
                const targetAnchors = calculateAnchorPoints(
                  connection.targetNodeId,
                  targetNode.x,
                  targetNode.y,
                  targetNode.width || 200,
                  targetNode.height || 150
                );

                const sourceAnchor = sourceAnchors.find(
                  (a) => a.position === connection.sourceAnchor
                );
                const targetAnchor = targetAnchors.find(
                  (a) => a.position === connection.targetAnchor
                );

                if (!sourceAnchor || !targetAnchor) return null;

                return (
                  <ConnectionLine
                    key={connection.id}
                    connection={connection}
                    sourceNodeId={connection.sourceNodeId}
                    targetNodeId={connection.targetNodeId}
                    sourceX={sourceAnchor.x}
                    sourceY={sourceAnchor.y}
                    targetX={targetAnchor.x}
                    targetY={targetAnchor.y}
                    sourceAnchor={connection.sourceAnchor}
                    targetAnchor={connection.targetAnchor}
                    isSelected={selectedConnectionId === connection.id}
                    onDoubleClick={() => {
                      setSelectedConnectionId(connection.id);
                      setShowDeleteConfirmation(true);
                    }}
                  />
                );
              })}

              {/* Pending connection (during drag) */}
              {pendingConnection && (
                <ConnectionLine
                  pendingConnection={pendingConnection}
                  sourceNodeId={pendingConnection.sourceNodeId}
                  sourceX={
                    calculateAnchorPoints(
                      pendingConnection.sourceNodeId,
                      nodes.find((n) => n.id === pendingConnection.sourceNodeId)?.x || 0,
                      nodes.find((n) => n.id === pendingConnection.sourceNodeId)?.y || 0,
                      200,
                      150
                    ).find((a) => a.position === pendingConnection.sourceAnchor)?.x || 0
                  }
                  sourceY={
                    calculateAnchorPoints(
                      pendingConnection.sourceNodeId,
                      nodes.find((n) => n.id === pendingConnection.sourceNodeId)?.x || 0,
                      nodes.find((n) => n.id === pendingConnection.sourceNodeId)?.y || 0,
                      200,
                      150
                    ).find((a) => a.position === pendingConnection.sourceAnchor)?.y || 0
                  }
                  targetX={pendingConnection.currentX}
                  targetY={pendingConnection.currentY}
                  sourceAnchor={pendingConnection.sourceAnchor}
                />
              )}
            </svg>

            {/* Story 2.4: Render Anchor Points (when Shift is held) */}
            {isConnectionMode && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ zIndex: 60 }}
              >
                {Array.from(visibleAnchors.entries()).map(([nodeId, anchors]) => {
                  const node = nodes.find((n) => n.id === nodeId);
                  if (!node) return null;

                  const nodeType = node.type; // Use node type to get color

                  return anchors.map((anchor) => (
                    <AnchorPoint
                      key={`${nodeId}-${anchor.position}`}
                      anchor={anchor}
                      nodeColor={nodeType ? undefined : '#ef4444'} // Will use node stage color
                      onMouseDown={(position) => {
                        startConnectionDrag(nodeId, position as any, anchor.x, anchor.y);
                      }}
                      onMouseEnter={() => {
                        setHoveredAnchor(nodeId, anchor.position as any);
                      }}
                      onMouseLeave={() => {
                        setHoveredAnchor(null, null);
                      }}
                    />
                  ));
                })}
              </svg>
            )}

            {/* Created Nodes */}
            {nodes.map((node) => {
              const isRecentlyCreated = Date.now() - node.createdAt < 1000;
              const isSelected = selectedNodeId === node.id;
              const isMultiSelected = selectedNodeIds.includes(node.id);
              const isDragged = dragState.draggedNodeId === node.id;

              return (
                <DraggableNode
                  key={node.id}
                  id={node.id}
                  type={node.type}
                  stage={node.stage}
                  content={node.content}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  status={node.status}
                  isSelected={isSelected}
                  isMultiSelected={isMultiSelected}
                  dragState={dragState}
                  isDragged={isDragged}
                  onMouseDown={dragHandlers.onMouseDown}
                  onTouchStart={dragHandlers.onTouchStart}
                  onClick={handleNodeClick}
                  multiSelectCount={selectedNodeIds.length}
                  showConnectors={isMultiSelected && selectedNodeIds.length > 1}
                />
              );
            })}

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">+</span>
                </div>
                <p className="text-xl font-medium text-gray-700 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  더블클릭하여 첫 번째 노드를 생성하세요
                </p>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  또는 이 영역을 클릭하세요
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                온보딩 진행률
              </span>
              <span className="text-sm font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {nodeCount}/3
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-500 ease-out"
                style={{ width: `${(nodeCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Story 1.3 Components */}
      <AIQuestionMode
        isVisible={showAIQuestion}
        onStart={handleStartAIQuestion}
        onSkip={handleSkipAIQuestion}
        onCreateNode={handleCreateNodeFromAI}
      />

      {/* Story 2.1: NodeTypeModal with 7 stages and tech-brutalist design */}
      {/* Replaces old NodeTypeSelector with progressive disclosure */}
      <NodeTypeModal
        isOpen={showNodeTypeSelector}
        onSelect={handleNodeTypeModalSelect}
        onClose={() => setShowNodeTypeSelector(false)}
      />

      <NodeCreationHint
        isVisible={showNodeCreationHint && nodes.length === 0}
        onDoubleClick={() => {}}
      />

      {/* Story 2.4: Connection Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 border-2 border-gray-900">
            <h3
              className="text-xl font-bold mb-4 text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              연결을 삭제하시겠습니까?
            </h3>
            <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (selectedConnectionId) {
                    deleteConnection(selectedConnectionId);
                  }
                  setSelectedConnectionId(null);
                  setShowDeleteConfirmation(false);
                }}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setSelectedConnectionId(null);
                  setShowDeleteConfirmation(false);
                }}
                className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-900"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Discovery Panel (Left Sidebar) */}
      <ProblemDiscovery isVisible={mode === 'problem-discovery' && aiGuideEnabled} />

      {/* Team Invite Panel */}
      {showTeamInvite && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 w-80 bg-white/95 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-xl p-6 z-40">
          <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            팀원 초대하기
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            팀원들과 함께 린스타트업 캔버스를 작성하고 아이디어를 발전시켜보세요.
          </p>
          <button className="w-full px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mb-2">
            초대 링크 복사
          </button>
          <p className="text-xs text-gray-500 text-center">
            팀 초대 기능은 Epic 7에서 구현됩니다
          </p>
        </div>
      )}

      {/* Story 2.2: Node Detail Sidebar (shown when node is selected) */}
      <NodeDetailSidebar
        node={nodes.find(n => n.id === selectedNodeId) || null}
        onClose={() => setSelectedNodeId(null)}
        onSave={(id, content) => {
          setNodes((prev) =>
            prev.map((node) =>
              node.id === id ? { ...node, content, updatedAt: Date.now() } : node
            )
          );
        }}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl z-50">
          <p className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {toastMessage}
          </p>
        </div>
      )}

      {/* Story 1.4: Celebration Modal */}
      <CelebrationModal
        isVisible={showCelebrationModal}
        mode={mode}
        onViewNextSteps={handleViewNextSteps}
        onContinueOnboarding={handleContinueOnboardingFromCelebration}
        onSwitchToMain={handleSwitchToMainFromCelebration}
      />

      {/* Story 1.4: Next Steps Card */}
      <NextStepsCard
        isVisible={showNextStepsCard}
        currentStep={1}
        totalSteps={7}
        nextStepName="문제 정의"
        nextStepDescription="문제 정의 단계에서는 고객의 관점에서 문제를 명확히 정의합니다"
        onStartNow={handleStartNextStep}
        onLater={handleLaterNextSteps}
      />

      {/* Story 1.4: Auto-Transition Modal */}
      <AutoTransitionModal
        isVisible={showAutoTransitionModal}
        countdownSeconds={2}
        onCancel={handleCancelAutoTransition}
        onTransition={handleExecuteAutoTransition}
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border-2 border-gray-900">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                온보딩 완료!
              </h2>
              <p className="text-gray-600">
                3개 이상의 노드를 생성하셨습니다. 메인 캔버스로 전환하시겠습니까?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSwitchToMain}
                className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                메인 캔버스로 전환
              </button>
              <button
                onClick={handleContinueOnboarding}
                className="w-full px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors"
              >
                계속 온보딩 모드 사용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingCanvas;
