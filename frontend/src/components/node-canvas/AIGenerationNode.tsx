/**
 * AI Generation Node Component
 * Represents AI-generated content with provider information
 */

import { Handle, Position, NodeProps } from 'reactflow';

export default function AIGenerationNode({ data }: NodeProps) {
  return (
    <div className="px-6 py-4 shadow-md rounded-lg border-2 bg-purple-100 border-purple-500 transform rotate-45 min-w-[150px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="transform -rotate-45">
        <div className="font-bold text-purple-800 text-center">{data.label}</div>
        <div className="text-xs text-purple-600 text-center mt-1">{data.provider}</div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}
