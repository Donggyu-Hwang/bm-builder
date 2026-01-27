/**
 * End Node Component
 * Represents the completion of a document workflow
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

function EndNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 shadow-md rounded-full bg-green-100 border-2 border-green-500">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="font-bold text-green-800">{data.label}</div>
    </div>
  );
}

export default memo(EndNode);
