/**
 * Custom Edge Component for Node Canvas
 * Implements enhanced edge styling with labels, animations, and interaction
 */

import { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getMarkerEnd,
  Position,
} from 'reactflow';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  data: {
    label?: string;
    type: 'sequential' | 'parallel' | 'conditional';
    dataFlow?: string;
    isMandatory: boolean;
    isAIConnection: boolean;
    sourceNode?: string;
    targetNode?: string;
    animated?: boolean;
  };
  markerEnd?: string;
}

export const CustomEdge = memo((props: CustomEdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
  } = props;

  const [isHovered, setIsHovered] = useState(false);

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Edge style based on type and hover state
  const edgeStyle: React.CSSProperties = {
    ...style,
    stroke: isHovered ? '#4CAF50' : '#94a3b8',
    strokeWidth: isHovered ? 3 : 2,
    strokeDasharray: data.isAIConnection ? '5,5' : 'none',
    opacity: data.isMandatory ? 1 : 0.5,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
  };

  // Get marker end for arrow
  const marker = getMarkerEnd(markerEnd);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        markerEnd={marker}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="react-flow__edge-path"
      />

      {/* Edge Label */}
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="edge-label-container"
          >
            <div
              className={`edge-label bg-white px-2 py-1 rounded text-xs font-medium border border-gray-300 shadow-sm ${
                isHovered ? 'border-green-500' : ''
              }`}
              style={{
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Connection Detail Tooltip on Hover */}
      {isHovered && (data.sourceNode || data.targetNode || data.dataFlow) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -100%) translate(${labelX}px,${labelY - 20}px)`,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
            className="connection-tooltip"
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm min-w-[200px]">
              {data.sourceNode && (
                <div className="mb-1">
                  <span className="text-gray-400">Source:</span>{' '}
                  <span className="font-medium">{data.sourceNode}</span>
                </div>
              )}
              {data.targetNode && (
                <div className="mb-1">
                  <span className="text-gray-400">Target:</span>{' '}
                  <span className="font-medium">{data.targetNode}</span>
                </div>
              )}
              <div className="mb-1">
                <span className="text-gray-400">Type:</span>{' '}
                <span className="font-medium capitalize">{data.type}</span>
              </div>
              {data.dataFlow && (
                <div className="text-xs text-gray-300 mt-1 pt-1 border-t border-gray-700">
                  {data.dataFlow}
                </div>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
