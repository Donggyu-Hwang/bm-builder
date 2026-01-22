/**
 * Animated Edge Component for Flow Visualization
 * Shows animated flow direction indicators
 */

import { memo, useEffect, useState } from 'react';
import {
  BaseEdge,
  getBezierPath,
  getMarkerEnd,
  Position,
} from 'reactflow';

interface AnimatedEdgeProps {
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
    isMandatory: boolean;
    isAIConnection: boolean;
    animated?: boolean;
  };
  markerEnd?: string;
}

export const AnimatedEdge = memo((props: AnimatedEdgeProps) => {
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

  const [offset, setOffset] = useState(0);

  // Animate the dash offset for flow effect
  useEffect(() => {
    if (!data.animated) return;

    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 20);
    }, 50);

    return () => clearInterval(interval);
  }, [data.animated]);

  // Calculate bezier path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Edge style
  const edgeStyle: React.CSSProperties = {
    ...style,
    stroke: data.isAIConnection ? '#8b5cf6' : '#94a3b8',
    strokeWidth: 2,
    strokeDasharray: data.isAIConnection ? '10 10' : 'none',
    strokeDashoffset: data.animated ? -offset : 0,
    opacity: data.isMandatory ? 1 : 0.5,
    transition: 'stroke-dashoffset 0.1s linear',
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
        className="react-flow__edge-path"
      />
    </>
  );
});

AnimatedEdge.displayName = 'AnimatedEdge';
