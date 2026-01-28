import React, { useState, useEffect, useCallback } from 'react';
import LeanStartupCanvas from '../components/canvas/LeanStartupCanvas';
import ProgressBar from '../components/canvas/ProgressBar';
import VersionSidebar from '../components/canvas/VersionSidebar';
import NodeDetailSidebar from '../components/canvas/NodeDetailSidebar';
import ExportModal from '../components/canvas/ExportModal';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { unlockAllStages } from '../store/canvasSlice';
import { CanvasStorageService } from '../services/canvasStorage.service';
import documentExportService from '../services/documentExport.service';

const CanvasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.canvas.nodes);
  const edges = useAppSelector((state) => state.canvas.edges);
  const [isVersionSidebarOpen, setIsVersionSidebarOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-save every 1 minute (Story 5.3)
  useEffect(() => {
    const timer = setInterval(() => {
      if (nodes.length > 0) {
        CanvasStorageService.saveVersion(
          nodes,
          useAppSelector((state) => state.canvas.edges)
        );
      }
    }, 60000); // 1 minute

    setAutoSaveTimer(timer);

    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [nodes]);

  // Check if progressive disclosure should be unlocked (Story 3.3)
  useEffect(() => {
    const stages = new Set(nodes.map((node) => (node.data as { stage?: number })?.stage || 0));
    if (stages.size >= 3) {
      dispatch(unlockAllStages());
    }
  }, [nodes, dispatch]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleExport = useCallback(
    async (format: 'pdf' | 'docx' | 'png', includeIncomplete: boolean) => {
      const result = await documentExportService.exportCanvas(nodes, edges, {
        format,
        includeIncomplete,
      });

      if (result.success) {
        alert(`${result.filename} 파일이 생성되었습니다`);
        setIsExportModalOpen(false);
      } else {
        alert(result.error || '내보내기 실패');
      }
    },
    [nodes, edges]
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header with progress bar */}
      <ProgressBar />

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">린스타트업 캔버스</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVersionSidebarOpen(true)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              버전 기록
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              disabled={nodes.length < 3}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              내보내기 {nodes.length < 3 && '(3+ 노드 필요)'}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <LeanStartupCanvas onNodeDoubleClick={handleNodeDoubleClick} />
      </div>

      {/* Version Sidebar */}
      <VersionSidebar
        isOpen={isVersionSidebarOpen}
        onClose={() => setIsVersionSidebarOpen(false)}
      />

      {/* Node Detail Sidebar */}
      <NodeDetailSidebar
        isOpen={selectedNodeId !== null}
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        nodeCount={nodes.length}
      />
    </div>
  );
};

export default CanvasPage;
