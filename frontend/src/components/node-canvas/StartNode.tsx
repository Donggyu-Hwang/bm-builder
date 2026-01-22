/**
 * Start Node Component
 * Represents the starting point of a document workflow
 */

import { Handle, Position, NodeProps } from 'reactflow';

export default function StartNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 shadow-md rounded-full bg-green-100 border-2 border-green-500">
      <div className="font-bold text-green-800">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
