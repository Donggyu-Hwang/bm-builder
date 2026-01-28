import React, { useState } from 'react';
import type { NodeType } from '../../types/canvas';

interface NodeTypeSelectorProps {
  nodeTypes: NodeType[];
  onSelect: (nodeTypeId: string) => void;
  onClose: () => void;
}

const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({ nodeTypes, onSelect, onClose }) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">노드 타입 선택</h2>
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

        <p className="text-gray-600 dark:text-gray-400 mb-6">생성할 노드 타입을 선택하세요</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.id}
              onClick={() => onSelect(nodeType.id)}
              onMouseEnter={() => setHoveredType(nodeType.id)}
              onMouseLeave={() => setHoveredType(null)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${
                  hoveredType === nodeType.id
                    ? 'border-gray-400 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }
              `}
              style={{
                borderColor: hoveredType === nodeType.id ? nodeType.color : undefined,
              }}
            >
              <div className="text-4xl mb-2">{nodeType.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {nodeType.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Stage {nodeType.stage}</div>
              <div
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{ backgroundColor: nodeType.color }}
              />
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeTypeSelector;
