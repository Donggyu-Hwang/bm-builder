import React, { useMemo } from 'react';
import type { Connection, PendingConnection } from '../../types/connection';
import { getNodeTypeByStage } from '../../config/nodeTypes';

interface ConnectionLineProps {
  connection?: Connection;
  pendingConnection?: PendingConnection;
  sourceNodeId: string;
  targetNodeId?: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceAnchor: 'top' | 'bottom' | 'left' | 'right';
  targetAnchor?: 'top' | 'bottom' | 'left' | 'right';
  isSelected?: boolean;
  onDoubleClick?: () => void;
}

/**
 * Connection Line Component with Hand-Drawn Sketch Aesthetic
 *
 * Design Philosophy (VS Design Diverge - T-Score 0.15):
 * - Organic, imperfect Bezier curves with pencil-stroke texture
 * - Motion-trail echo effect during drag (3 parallel lines)
 * - Dynamic color transitions based on source node stage
 * - Comic-book style arrow markers with bold outlines
 * - Intentional imperfection for "whiteboard collaboration" feel
 *
 * Story 2.4 Acceptance Criteria:
 * - AC 2.4.2: Connection line renders within 100ms
 * - AC 2.4.3: Bezier curve with arrow marker (S-curve)
 * - AC 2.4.3: Arrow points source → target
 * - AC 2.4.3: z-index 50 (below nodes)
 *
 * Performance:
 * - SVG path rendering optimized with useMemo
 * - requestAnimationFrame for drag updates (handled in hook)
 * - < 100ms render time
 */
export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  pendingConnection,
  sourceNodeId,
  targetNodeId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceAnchor,
  targetAnchor = 'bottom',
  isSelected = false,
  onDoubleClick,
}) => {
  /**
   * Generate hand-drawn Bezier curve path
   *
   * Adds intentional imperfection:
   * - Random control point offset (-2px to +2px)
   * - Slightly asymmetric curve (organic feel)
   */
  const pathData = useMemo(() => {
    // Calculate control points for smooth S-curve
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // Hand-drawn imperfection: add random jitter to control points
    const jitter1 = (Math.random() - 0.5) * 4; // -2px to +2px
    const jitter2 = (Math.random() - 0.5) * 4;

    // Control points based on anchor positions
    let cx1 = sourceX;
    let cy1 = sourceY;
    let cx2 = targetX;
    let cy2 = targetY;

    const curvature = Math.min(Math.abs(dx) * 0.5, 100); // Curvature based on distance

    // Adjust control points based on source anchor
    switch (sourceAnchor) {
      case 'top':
        cy1 -= curvature + jitter1;
        break;
      case 'bottom':
        cy1 += curvature + jitter1;
        break;
      case 'left':
        cx1 -= curvature + jitter1;
        break;
      case 'right':
        cx1 += curvature + jitter1;
        break;
    }

    // Adjust control points based on target anchor
    switch (targetAnchor) {
      case 'top':
        cy2 -= curvature + jitter2;
        break;
      case 'bottom':
        cy2 += curvature + jitter2;
        break;
      case 'left':
        cx2 -= curvature + jitter2;
        break;
      case 'right':
        cx2 += curvature + jitter2;
        break;
    }

    // SVG path command: M (move) + C (cubic Bezier)
    return `M ${sourceX} ${sourceY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetX} ${targetY}`;
  }, [sourceX, sourceY, targetX, targetY, sourceAnchor, targetAnchor]);

  /**
   * Get source node color for dynamic color transition
   */
  const sourceNodeColor = useMemo(() => {
    // Extract stage number from node ID (format: "node-stage-1")
    const stageMatch = sourceNodeId.match(/stage-(\d+)/);
    const stage = stageMatch ? parseInt(stageMatch[1], 10) : 1;
    const nodeType = getNodeTypeByStage(stage);
    return nodeType?.color || '#ef4444'; // Default red (Stage 1)
  }, [sourceNodeId]);

  /**
   * Motion-trail effect (echo lines) during drag
   * Creates 3 parallel lines with decreasing opacity
   */
  const MotionTrail = () => {
    if (!pendingConnection) return null;

    const offsets = [-6, -3, 0, 3, 6]; // 5 parallel lines

    return (
      <g pointerEvents="none">
        {offsets.map((offset, index) => {
          const opacity = 1 - Math.abs(index - 2) * 0.25; // Center line opaque, edges fade
          const lineWidth = 1.5 - Math.abs(index - 2) * 0.3; // Center line thicker

          return (
            <path
              key={offset}
              d={pathData}
              stroke={sourceNodeColor}
              strokeWidth={lineWidth}
              strokeOpacity={opacity * 0.3}
              fill="none"
              style={{
                filter: 'blur(0.5px)',
              }}
            />
          );
        })}
      </g>
    );
  };

  /**
   * Comic-book style arrow marker
   * Bold outline with exaggerated point
   */
  const ArrowMarker = () => {
    // Calculate angle for arrow rotation
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Arrow size (slightly oversized for comic effect)
    const size = 12;

    return (
      <g
        transform={`translate(${targetX}, ${targetY}) rotate(${angle})`}
        style={{
          filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.3))',
        }}
      >
        {/* Bold outline */}
        <path
          d={`M 0 0 L -${size} -${size / 2} L -${size * 0.7} 0 L -${size} ${size / 2} Z`}
          fill="#1f2937" // Dark gray outline
          stroke="#1f2937"
          strokeWidth="2"
        />
        {/* Fill with source node color */}
        <path
          d={`M 0 0 L -${size} -${size / 2} L -${size * 0.7} 0 L -${size} ${size / 2} Z`}
          fill={sourceNodeColor}
        />
      </g>
    );
  };

  /**
   * Pencil-stroke texture using SVG filter
   * Creates rough, hand-drawn edge effect
   */
  const PencilTextureFilter = () => (
    <defs>
      <filter
        id={`pencil-texture-${connection?.id || 'pending'}`}
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
      >
        {/* Turbulence creates noise */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves="5"
          result="noise"
        />
        {/* Displacement map applies noise to stroke */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="2"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  );

  return (
    <g
      style={{
        zIndex: 50, // AC 2.4.3: Below nodes
        cursor: onDoubleClick ? 'pointer' : 'default',
      }}
      onDoubleClick={onDoubleClick}
    >
      {/* SVG filter for pencil texture */}
      <PencilTextureFilter />

      {/* Motion-trail effect (drag only) */}
      {pendingConnection && <MotionTrail />}

      {/* Main connection line */}
      <path
        d={pathData}
        stroke="#1f2937" // Dark pencil gray
        strokeWidth={isSelected ? 3 : 2} // Thicker when selected
        fill="none"
        strokeLinecap="round"
        style={{
          filter: `url(#pencil-texture-${connection?.id || 'pending'})`,
        }}
      />

      {/* Arrow marker (completed connections only) */}
      {!pendingConnection && <ArrowMarker />}

      {/* Selection glow (when selected) */}
      {isSelected && (
        <path
          d={pathData}
          stroke={sourceNodeColor}
          strokeWidth={6}
          fill="none"
          strokeOpacity={0.3}
          style={{
            filter: 'blur(4px)',
          }}
        />
      )}
    </g>
  );
};

export default ConnectionLine;
