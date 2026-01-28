import React, { useState, useEffect } from 'react';
import { CanvasVersion, CanvasStorageService } from '../../services/canvasStorage.service';
import { useAppDispatch } from '../../hooks/useRedux';
import { setNodes, setEdges } from '../../store/canvasSlice';

interface VersionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionSidebar: React.FC<VersionSidebarProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [versions, setVersions] = useState<CanvasVersion[]>([]);

  useEffect(() => {
    if (isOpen) {
      setVersions(CanvasStorageService.getVersions());
    }
  }, [isOpen]);

  const handleRestore = (timestamp: number) => {
    const restored = CanvasStorageService.restoreVersion(timestamp);
    if (restored) {
      dispatch(setNodes(restored.nodes));
      dispatch(setEdges(restored.edges));
      setVersions(CanvasStorageService.getVersions());
    }
  };

  const handleDelete = (timestamp: number) => {
    CanvasStorageService.deleteVersion(timestamp);
    setVersions(CanvasStorageService.getVersions());
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-40 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">버전 기록</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>저장된 버전이 없습니다</p>
            <p className="text-sm mt-2">1분마다 자동으로 스냅샷이 생성됩니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.timestamp}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {version.label}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(version.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(version.timestamp)}
                    className="flex-1 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                  >
                    복원
                  </button>
                  <button
                    onClick={() => handleDelete(version.timestamp)}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    삭제
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {version.nodes.length} 노드 • {version.edges.length} 연결
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionSidebar;
