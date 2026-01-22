/**
 * Node Canvas Page
 * Visualizes document generation workflow using React Flow
 */

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  MiniMap,
  NodeDragHandler,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { generatedDocumentsApi, GeneratedDocument } from '../api/generatedDocumentsApi';
import { nodesApi } from '../api/nodesApi';
import { snapToGrid } from '../utils/nodeUtils';

import StartNode from '../components/node-canvas/StartNode';
import SectionNode from '../components/node-canvas/SectionNode';
import AIGenerationNode from '../components/node-canvas/AIGenerationNode';
import EndNode from '../components/node-canvas/EndNode';
import NodeDetailModal from '../components/node-canvas/NodeDetailModal';
import { ExportModal } from '../components/node-canvas/ExportModal';
import { ShareLinkModal } from '../components/node-canvas/ShareLinkModal';
import { ZoomControls } from '../components/node-canvas/ZoomControls';
import { NodeSearch } from '../components/node-canvas/NodeSearch';
import { ViewpointBookmarks } from '../components/node-canvas/ViewpointBookmarks';
import { useCanvasShortcuts } from '../components/node-canvas/useCanvasShortcuts';
import { useViewportPersistence } from '../components/node-canvas/useViewportPersistence';
// Story 6.3: Import edge components
import { CustomEdge } from '../components/node-canvas/CustomEdge';
import { AnimatedEdge } from '../components/node-canvas/AnimatedEdge';
import { ConnectionEditModal } from '../components/node-canvas/ConnectionEditModal';
import { SimplificationToggle } from '../components/node-canvas/SimplificationToggle';
import { EdgeTypeSelector, EdgeType } from '../components/node-canvas/EdgeTypeSelector';
import { useFlowSimplification } from '../components/node-canvas/useFlowSimplification';
import '../components/node-canvas/navigation-styles.css';
import '../../styles/node-canvas-print.css';

const nodeTypes = {
  start: StartNode,
  section: SectionNode,
  aiGeneration: AIGenerationNode,
  end: EndNode,
};

// Story 6.3: Define edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
  animated: AnimatedEdge,
};

// Story 6.3: Edge data interface
interface EdgeData {
  label?: string;
  type: 'sequential' | 'parallel' | 'conditional';
  dataFlow?: string;
  isMandatory: boolean;
  isAIConnection: boolean;
  sourceNode?: string;
  targetNode?: string;
  animated?: boolean;
}

export const NodeCanvasPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  // Story 6.3: State for selected edge
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  // Story 6.3: State for edge type selector
  const [edgeType, setEdgeType] = useState<EdgeType>('bezier');
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Story 6.3: Flow simplification hook
  const { simplifyEdges } = useFlowSimplification();

  // Enable canvas keyboard shortcuts
  useCanvasShortcuts();

  // Enable viewport persistence
  useViewportPersistence({
    documentId,
    enabled: true,
    saveInterval: 500,
  });

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) return;

      try {
        const doc = await generatedDocumentsApi.getDocument(documentId);
        setDocument(doc);

        // If it's a pitch deck, load slides
        if (doc.template_type === 'pitch_deck') {
          await loadSlides(documentId);
        }
      } catch (error) {
        console.error('Failed to load document:', error);
        alert('문서를 불러오는데 실패했습니다');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const loadSlides = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/slides`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSlides(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load slides:', error);
    }
  };

  // Parse document content into sections
  const parseSections = useMemo(() => {
    if (!document) return [];

    const sections: any[] = [];
    const content = document.content || '';

    // Parse markdown headers as sections
    const lines = content.split('\n');
    let currentSection: any = null;

    lines.forEach((line, index) => {
      // Match markdown headers (## or ###)
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);

      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          id: `section-${sections.length + 1}`,
          title: headerMatch[2].trim(),
          content: '',
          status: document.status === 'completed' ? '완료' : '진행중',
          wordCount: 0,
          ai_generated: document.ai_provider ? true : false,
          ai_provider: document.ai_provider,
          updated_at: document.updated_at,
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
        currentSection.wordCount = currentSection.content.length;
      }
    });

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // If no sections found, create a default section
    if (sections.length === 0 && content.trim()) {
      sections.push({
        id: 'section-1',
        title: document.title || '문서 내용',
        content: content,
        status: document.status === 'completed' ? '완료' : '진행중',
        wordCount: content.length,
        ai_generated: document.ai_provider ? true : false,
        ai_provider: document.ai_provider,
        updated_at: document.updated_at,
      });
    }

    return sections;
  }, [document]);

  // Use slides if available, otherwise use parsed sections
  const sections = slides.length > 0 ? slides : parseSections;

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

    // Section nodes (or slides for pitch decks)
    sections.forEach((section: any) => {
      nodes.push({
        id: `section-${section.id || sections.indexOf(section)}`,
        type: 'section',
        position: { x: 250, y: yOffset },
        data: {
          label: section.title || `섹션 ${sections.indexOf(section) + 1}`,
          status: section.status || '완료',
          wordCount: section.content?.length || 0,
          lastEdited: section.updated_at || document.updated_at,
        },
      });
      yOffset += 150;

      // AI generation nodes if applicable
      if (section.ai_generated || document.ai_provider) {
        nodes.push({
          id: `ai-${section.id || sections.indexOf(section)}`,
          type: 'aiGeneration',
          position: { x: 550, y: yOffset - 100 },
          data: {
            label: 'AI 생성',
            provider: section.ai_provider || document.ai_provider || 'claude',
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
  }, [document, sections]);

  // Story 6.3: Initialize edges with enhanced data
  const initialEdges: Edge<EdgeData>[] = useMemo(() => {
    if (!document) return [];

    const edges: Edge<EdgeData>[] = [];
    let previousNodeId = 'start';
    let previousNodeLabel = '시작';

    sections.forEach((section: any, index: number) => {
      const sectionNodeId = `section-${section.id || index}`;
      const sectionLabel = section.title || `섹션 ${index + 1}`;

      edges.push({
        id: `edge-${previousNodeId}-${sectionNodeId}`,
        source: previousNodeId,
        target: sectionNodeId,
        type: section.ai_generated || document.ai_provider ? 'animated' : 'custom',
        data: {
          label: '다음 섹션',
          type: 'sequential',
          isMandatory: true,
          isAIConnection: false,
          sourceNode: previousNodeLabel,
          targetNode: sectionLabel,
          animated: section.ai_generated || document.ai_provider,
        },
        markerEnd: { type: 'arrowclosed' },
      });

      // AI generation edge
      if (section.ai_generated || document.ai_provider) {
        const aiNodeId = `ai-${section.id || index}`;
        edges.push({
          id: `edge-${sectionNodeId}-${aiNodeId}`,
          source: sectionNodeId,
          target: aiNodeId,
          type: 'animated',
          data: {
            label: 'AI 생성',
            type: 'parallel',
            isMandatory: true,
            isAIConnection: true,
            sourceNode: sectionLabel,
            targetNode: 'AI 생성',
            dataFlow: `AI에서 ${section.wordCount || 0}자 생성`,
            animated: true,
          },
          markerEnd: { type: 'arrowclosed' },
        });

        previousNodeId = aiNodeId;
        previousNodeLabel = 'AI 생성';
      } else {
        previousNodeId = sectionNodeId;
        previousNodeLabel = sectionLabel;
      }
    });

    // Connect to end node
    edges.push({
      id: `edge-${previousNodeId}-end`,
      source: previousNodeId,
      target: 'end',
      type: 'custom',
      data: {
        label: '완성',
        type: 'sequential',
        isMandatory: true,
        isAIConnection: false,
        sourceNode: previousNodeLabel,
        targetNode: '완성된 문서',
      },
      markerEnd: { type: 'arrowclosed' },
    });

    return edges;
  }, [document, sections]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Story 6.3: Simplify edges based on toggle state
  const displayEdges = useMemo(() => {
    return simplifyEdges(edges);
  }, [edges, simplifyEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Story 6.2: Handle node drag - save position when drag ends
  const onNodeDragStop: NodeDragHandler = useCallback(
    async (_event, node, _nodes) => {
      if (!documentId) return;

      // Snap to grid (20px)
      const snappedPosition = snapToGrid(node.position);

      // Update node position in state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, position: snappedPosition }
            : n
        )
      );

      // Save to backend
      setIsSaving(true);
      try {
        const updatedNodes = _nodes || nodes;
        const currentNodes = updatedNodes.map((n) =>
          n.id === node.id
            ? { ...n, position: snappedPosition }
            : n
        );
        await nodesApi.updateDocumentNodes(documentId, currentNodes);
      } catch (error) {
        console.error('Failed to save node position:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, nodes, setNodes]
  );

  // Story 6.2: Handle node double-click - open detail modal
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Story 6.3: Handle edge click to open edit modal
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge as Edge<EdgeData>);
  }, []);

  // Story 6.3: Handle saving edge updates
  const handleSaveEdge = useCallback((edgeId: string, updates: Partial<EdgeData>) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, ...updates } }
          : edge
      )
    );
  }, [setEdges]);

  // Story 6.3: Handle deleting edge
  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  // Story 6.3: Handle edge type change
  const handleEdgeTypeChange = useCallback((type: EdgeType) => {
    setEdgeType(type);
    // Update all edges to use the new type
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: edge.data.isAIConnection ? 'animated' : 'custom',
      }))
    );
  }, [setEdges]);

  // Story 6.2: Handle node save
  const handleSaveNode = async (updates: Partial<Node>) => {
    if (!documentId || !selectedNode) return;

    try {
      await nodesApi.updateNode(documentId, selectedNode.id, updates);

      // Update local state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, ...updates }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to update node:', error);
      alert('노드 업데이트에 실패했습니다');
    }
  };

  // Story 6.2: Handle node delete
  const handleDeleteNode = async () => {
    if (!documentId || !selectedNode) return;

    try {
      await nodesApi.deleteNode(documentId, selectedNode.id);

      // Update local state - remove node
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));

      // Remove connected edges
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
    } catch (error) {
      console.error('Failed to delete node:', error);
      alert('노드 삭제에 실패했습니다');
    }
  };

  // Story 6.2: Handle node duplicate
  const handleDuplicateNode = async () => {
    if (!documentId || !selectedNode) return;

    try {
      const duplicated = await nodesApi.duplicateNode(documentId, selectedNode.id);

      // Add duplicated node to state
      setNodes((nds) => [...nds, duplicated as Node]);
    } catch (error) {
      console.error('Failed to duplicate node:', error);
      alert('노드 복제에 실패했습니다');
    }
  };

  // Story 6.2: Load saved node positions from document
  useEffect(() => {
    const loadNodePositions = async () => {
      if (!documentId || !document) return;

      try {
        const doc = await generatedDocumentsApi.getDocument(documentId);

        // Check if document has saved node positions
        if (doc.nodes && Array.isArray(doc.nodes) && doc.nodes.length > 0) {
          // Merge saved positions with current nodes
          setNodes((currentNodes) =>
            currentNodes.map((currentNode) => {
              const savedNode = doc.nodes.find((n: any) => n.id === currentNode.id);
              if (savedNode && savedNode.position) {
                return {
                  ...currentNode,
                  position: savedNode.position,
                  data: {
                    ...currentNode.data,
                    ...savedNode.data,
                  },
                };
              }
              return currentNode;
            })
          );
        }
      } catch (error) {
        console.error('Failed to load node positions:', error);
      }
    };

    loadNodePositions();
  }, [documentId, document, setNodes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">문서를 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/documents')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            문서 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.25}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />

        {/* MiniMap for navigation overview */}
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#10b981';
              case 'end':
                return '#ef4444';
              case 'aiGeneration':
                return '#8b5cf6';
              case 'section':
              default:
                return '#3b82f6';
            }
          }}
          nodeStrokeWidth={2}
          zoomable
          pannable
          ariaLabel="Mini map for navigation"
        />

        {/* Document info panel */}
        <Panel position="top-left">
          <div className="bg-white rounded-lg shadow-md p-4 mb-2">
            <h2 className="text-lg font-bold text-gray-900">{document.title}</h2>
            <p className="text-sm text-gray-500">
              {document.template_type} • {sections.length}개 섹션
            </p>
            {isSaving && (
              <p className="text-xs text-purple-600 mt-1">저장 중...</p>
            )}
          </div>

          {/* Navigation controls panel */}
          <div className="bg-white rounded-lg shadow-md p-3 space-y-2">
            <NodeSearch nodes={nodes} />
            <ViewpointBookmarks documentId={documentId} />
          </div>
        </Panel>

        {/* Action buttons panel */}
        <Panel position="top-right">
          <div className="flex flex-col gap-2">
            {/* Story 6.3: Edge control buttons */}
            <div className="flex gap-2">
              <SimplificationToggle />
              <EdgeTypeSelector currentType={edgeType} onTypeChange={handleEdgeTypeChange} />
            </div>
            
            {/* Export, Share, and Back buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="내보내기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">내보내기</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="공유"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">공유</span>
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="문서로 돌아가기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">돌아가기</span>
              </button>
            </div>
          </div>
        </Panel>

        {/* Zoom controls */}
        <Panel position="bottom-right">
          <ZoomControls />
        </Panel>
      </ReactFlow>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          canvasRef={canvasRef}
        />
      )}

      {/* Share Link Modal */}
      {showShareModal && documentId && (
        <ShareLinkModal
          documentId={documentId}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Node Detail Modal (Story 6.2) */}
      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveNode}
          onDelete={handleDeleteNode}
          onDuplicate={handleDuplicateNode}
        />
      )}

      {/* Connection Edit Modal (Story 6.3) */}
      {selectedEdge && (
        <ConnectionEditModal
          edge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onSave={handleSaveEdge}
          onDelete={handleDeleteEdge}
        />
      )}
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
