import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateNode } from '../../store/canvasSlice';
import type { CustomNodeData } from './CustomNode';
import AISuggestionPanel from './AISuggestionPanel';

interface NodeDetailSidebarProps {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
}

const NodeDetailSidebar: React.FC<NodeDetailSidebarProps> = ({ isOpen, nodeId, onClose }) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.canvas.nodes);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const node = nodes.find((n) => n.id === nodeId);
  const nodeData = node?.data as CustomNodeData;

  useEffect(() => {
    if (nodeData?.content) {
      setContent(nodeData.content as string);
    } else {
      setContent('');
    }
  }, [nodeData]);

  const handleSave = useCallback(() => {
    if (!node) return;

    setIsSaving(true);
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        content,
        inProgress: content.length > 0,
        completed: content.length > 100,
      },
    };

    dispatch(updateNode(updatedNode));

    // Auto-save to localStorage
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [node, content, dispatch]);

  const handleApplySuggestion = useCallback(
    (suggestionContent: string) => {
      setContent((prev) => prev + '\n\n' + suggestionContent);
      handleSave();
    },
    [handleSave]
  );

  if (!isOpen || !node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-gray-800 shadow-2xl z-40 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{nodeData?.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{nodeData?.label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stage {nodeData?.stage}</p>
            </div>
          </div>
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

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{nodeData?.description}</p>
        </div>

        {/* Content Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="이 노드에 대한 내용을 입력하세요..."
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{content.length} 자</span>
            {isSaving && (
              <span className="text-xs text-green-600 dark:text-green-400">저장 중...</span>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">상태</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {nodeData?.completed ? (
                <span className="text-green-600 dark:text-green-400">✓</span>
              ) : nodeData?.inProgress ? (
                <span className="text-yellow-600 dark:text-yellow-400">●</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-600">○</span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {nodeData?.completed ? '완료' : nodeData?.inProgress ? '진행 중' : '미시작'}
              </span>
            </div>
            {nodeData?.completed && content.length > 100 && (
              <p className="text-xs text-green-600 dark:text-green-400">
                이 노드는 완료된 것으로 표시됩니다
              </p>
            )}
          </div>
        </div>

        {/* AI Suggestion (Story 4.3) */}
        {nodeId && <AISuggestionPanel nodeId={nodeId} onApplySuggestion={handleApplySuggestion} />}
      </div>
    </div>
  );
};

export default NodeDetailSidebar;
