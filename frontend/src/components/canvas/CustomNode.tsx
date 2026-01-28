import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface CustomNodeData {
  label: string;
  stage: number;
  color: string;
  icon: string;
  description: string;
  completed?: boolean;
  inProgress?: boolean;
  content?: string;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const nodeStyle = {
    background: data.completed ? '#dcfce7' : data.inProgress ? '#fef9c3' : '#f3f4f6',
    border: `2px solid ${data.color}`,
    borderRadius: '12px',
    padding: '16px',
    minWidth: '200px',
    boxShadow: selected ? `0 0 0 3px ${data.color}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={nodeStyle} className="dark:bg-gray-800">
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />

      <div className="flex items-start gap-3">
        <div className="text-3xl">{data.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {data.label}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {data.description}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: data.color }}
            >
              Stage {data.stage}
            </span>
            {data.completed && (
              <span className="text-green-600 dark:text-green-400 text-xs">✓ 완료</span>
            )}
            {data.inProgress && !data.completed && (
              <span className="text-yellow-600 dark:text-yellow-400 text-xs">● 진행 중</span>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
    </div>
  );
};

export default CustomNode;
