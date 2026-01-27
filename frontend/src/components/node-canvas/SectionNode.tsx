/**
 * Section Node Component
 * Represents a document section with status and metadata
 * Story 6.2: Enhanced with visual feedback and custom styling
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

function SectionNode({ data, selected }: NodeProps) {
  const statusColors: Record<string, string> = {
    완료: 'bg-blue-100 border-blue-500 text-blue-800',
    진행중: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    대기중: 'bg-gray-100 border-gray-500 text-gray-800',
  };

  const colorClass = statusColors[data.status] || statusColors.대기중;

  // Apply custom color if provided (Story 6.2)
  const backgroundColor = data.color ? `${data.color}20` : undefined;
  const borderColor = selected ? 'ring-2 ring-purple-400 ring-offset-2' : '';

  return (
    <div
      className={`px-6 py-4 shadow-md rounded-lg border-2 transition-all duration-200 min-w-[200px] cursor-move hover:shadow-lg ${colorClass} ${borderColor}`}
      style={{ backgroundColor }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {/* Node Header with Icon (Story 6.2) */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-lg">{data.label}</div>

        {/* Icon display */}
        {data.icon && (
          <div className="text-xs opacity-70">
            <span className="inline-block w-6 h-6 bg-white/50 rounded flex items-center justify-center text-sm">
              {data.icon === 'file-text' && '📄'}
              {data.icon === 'image' && '🖼️'}
              {data.icon === 'code' && '💻'}
              {data.icon === 'chart' && '📊'}
              {data.icon === 'database' && '🗄️'}
              {data.icon === 'settings' && '⚙️'}
              {data.icon === 'user' && '👤'}
              {data.icon === 'users' && '👥'}
              {data.icon === 'star' && '⭐'}
              {data.icon === 'heart' && '❤️'}
              {data.icon === 'check' && '✅'}
              {data.icon === 'alert-circle' && '⚠️'}
            </span>
          </div>
        )}
      </div>

      {/* Node Content */}
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded bg-white/50">{data.status}</span>
          <span className="text-xs">{data.wordCount?.toLocaleString()}자</span>
        </div>
        {data.lastEdited && (
          <div className="text-xs opacity-75">
            {new Date(data.lastEdited).toLocaleString('ko-KR')}
          </div>
        )}
      </div>

      {/* Notes indicator (Story 6.2) */}
      {data.notes && (
        <div className="mt-2 pt-2 border-t border-black/10">
          <div className="text-xs opacity-70 truncate" title={data.notes}>
            📝 {data.notes}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(SectionNode);
