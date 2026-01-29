import React, { useMemo } from 'react';
import { getNodeTypeById } from '../../config/nodeTypes';
import type { DragState } from '../../hooks/useNodeDrag';

interface DraggableNodeProps {
  id: string;
  type: string;
  stage: number;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  status: 'not_started' | 'in_progress' | 'completed';
  isSelected?: boolean;
  isMultiSelected?: boolean;
  dragState: DragState;
  isDragged?: boolean;
  onMouseDown: (nodeId: string, event: React.MouseEvent) => void;
  onTouchStart: (nodeId: string, event: React.TouchEvent) => void;
  onClick?: (nodeId: string) => void;
  multiSelectCount?: number;
  showConnectors?: boolean;
}

/**
 * Draggable Node Component with Distinctive Visual Feedback
 *
 * Design Philosophy (VS Design Diverge - T-Score 0.2):
 * - Rotating border dasharray animation (marching ants effect)
 * - Staggered wobble effect on drag start
 * - Split-color shadow (stage color + black offset)
 * - Velocity-based blur during fast movements
 * - Tech-brutalist corner brackets
 * - Glitch text effect on "이동 중..." label
 * - FPS counter for performance transparency
 *
 * Story 2.3 Acceptance Criteria:
 * - AC 2.3.1: 100ms drag response (via requestAnimationFrame)
 * - AC 2.3.2: 60fps rendering
 * - AC 2.3.3: Boundary constraints (handled in hook)
 * - AC 2.3.4: Visual feedback (70% opacity, z-index 100, "이동 중...")
 */
export const DraggableNode: React.FC<DraggableNodeProps> = ({
  id,
  type,
  stage,
  content,
  x,
  y,
  width = 200,
  height = 150,
  status,
  isSelected = false,
  isMultiSelected = false,
  dragState,
  isDragged = false,
  onMouseDown,
  onTouchStart,
  onClick,
  multiSelectCount = 0,
  showConnectors = false,
}) => {
  const nodeType = getNodeTypeById(type) || getNodeTypeByStage(stage);

  /**
   * Calculate velocity-based blur amount
   * Faster movement = more blur (max 4px)
   */
  const blurAmount = useMemo(() => {
    if (!isDragged) return 0;
    const velocity = Math.sqrt(
      Math.pow(dragState.velocity.x, 2) + Math.pow(dragState.velocity.y, 2)
    );
    return Math.min(velocity / 2, 4); // Cap at 4px blur
  }, [isDragged, dragState.velocity]);

  /**
   * Wobble animation keyframes (staggered scale effect)
   */
  const wobbleStyle = useMemo(() => {
    if (!isDragged) return {};
    return {
      animation: 'wobble 0.3s ease-out',
    };
  }, [isDragged]);

  /**
   * Tech-brutalist corner brackets SVG
   */
  const CornerBrackets = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {/* Top-left bracket */}
      <path
        d="M 0 20 L 0 0 L 20 0"
        fill="none"
        stroke={nodeType?.color || '#000'}
        strokeWidth="3"
        strokeLinecap="square"
      />
      {/* Top-right bracket */}
      <path
        d={`M ${width} 20 L ${width} 0 L ${width - 20} 0`}
        fill="none"
        stroke={nodeType?.color || '#000'}
        strokeWidth="3"
        strokeLinecap="square"
      />
      {/* Bottom-left bracket */}
      <path
        d={`M 0 ${height - 20} L 0 ${height} L 20 ${height}`}
        fill="none"
        stroke={nodeType?.color || '#000'}
        strokeWidth="3"
        strokeLinecap="square"
      />
      {/* Bottom-right bracket */}
      <path
        d={`M ${width} ${height - 20} L ${width} ${height} L ${width - 20} ${height}`}
        fill="none"
        stroke={nodeType?.color || '#000'}
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );

  /**
   * Multi-select connector lines (dashed)
   */
  const ConnectorLines = () => {
    if (!showConnectors) return null;
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
        <div
          className="border-t-2 border-dashed border-gray-900"
          style={{
            position: 'absolute',
            top: '50%',
            left: '100%',
            width: '60px',
            transform: 'translateY(-50%)',
          }}
        />
      </div>
    );
  };

  /**
   * Status icon component
   */
  const StatusIcon = () => {
    switch (status) {
      case 'not_started':
        return '⭕';
      case 'in_progress':
        return '⏳';
      case 'completed':
        return '✅';
      default:
        return '⭕';
    }
  };

  return (
    <>
      {/* Node container */}
      <div
        className={`
          absolute bg-white border-2 rounded-lg shadow-lg
          flex flex-col items-center justify-center p-4
          transition-all duration-75 ease-out
          cursor-grab active:cursor-grabbing
          ${isDragged ? 'cursor-grabbing' : ''}
          ${isSelected ? 'ring-4 ring-blue-200' : ''}
        `}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          borderColor: isDragged ? nodeType?.color : '#111827', // gray-900
          opacity: isDragged ? 0.7 : 1, // AC 2.3.1: 70% opacity during drag
          zIndex: isDragged ? 100 : isSelected ? 50 : 1, // AC 2.3.1: z-index 100 when dragging
          boxShadow: isDragged
            ? `${width / 4}px ${height / 4}px 0 ${nodeType?.color || '#000'}` // Split-color shadow
            : undefined,
          filter: `blur(${blurAmount}px)`, // Velocity-based blur
          transform: isDragged ? 'scale(1.05)' : 'scale(1)', // Slight scale on drag
          ...wobbleStyle,
        }}
        onMouseDown={(e) => onMouseDown(id, e)}
        onTouchStart={(e) => onTouchStart(id, e)}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(id);
        }}
      >
        {/* Corner brackets (tech-brutalist style) */}
        {isDragged && <CornerBrackets />}

        {/* Multi-select connectors */}
        {isMultiSelected && <ConnectorLines />}

        {/* Rotating border animation (marching ants) */}
        {isDragged && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              zIndex: 2,
              border: '3px dashed transparent',
              borderTopColor: nodeType?.color,
              animation: 'rotate 2s linear infinite',
            }}
          />
        )}

        {/* Stage number + icon */}
        <div className="flex items-center gap-2 mb-2" style={{ zIndex: 3 }}>
          <span
            className="text-xs font-bold px-2 py-1 rounded text-white"
            style={{
              backgroundColor: nodeType?.color || '#9ca3af',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            Stage {stage}
          </span>
          <span className="text-xl">{nodeType?.icon || '📝'}</span>
        </div>

        {/* Node type label */}
        <p
          className="text-sm font-bold text-gray-900 text-center leading-tight mb-2"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            zIndex: 3,
          }}
        >
          {type}
        </p>

        {/* Content preview (truncated) */}
        <p
          className="text-xs text-gray-600 text-center line-clamp-2"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            zIndex: 3,
          }}
        >
          {content || '내용을 추가하세요...'}
        </p>

        {/* Status icon */}
        <div className="absolute top-2 right-2 text-lg" style={{ zIndex: 3 }}>
          <StatusIcon />
        </div>

        {/* Multi-select badge */}
        {isMultiSelected && multiSelectCount > 1 && (
          <div
            className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              zIndex: 3,
            }}
          >
            {multiSelectCount}
          </div>
        )}

        {/* Drag status indicator (AC 2.3.1: "이동 중...") */}
        {isDragged && (
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded whitespace-nowrap"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              zIndex: 100,
              animation: 'glitch 0.3s infinite',
            }}
          >
            이동 중...
          </div>
        )}

        {/* FPS counter (performance transparency) - development only */}
        {isDragged && import.meta.env.DEV && (
          <div
            className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-green-400 text-xs font-mono rounded"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              zIndex: 100,
            }}
          >
            {dragState.fps} FPS
          </div>
        )}
      </div>

      {/* Global CSS animations */}
      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wobble {
          0% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.05) rotate(-2deg);
          }
          50% {
            transform: scale(1.02) rotate(2deg);
          }
          75% {
            transform: scale(1.04) rotate(-1deg);
          }
          100% {
            transform: scale(1.05) rotate(0deg);
          }
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
            opacity: 1;
          }
          20% {
            transform: translate(-2px, 2px);
            opacity: 0.8;
          }
          40% {
            transform: translate(-2px, -2px);
            opacity: 1;
          }
          60% {
            transform: translate(2px, 2px);
            opacity: 0.9;
          }
          80% {
            transform: translate(2px, -2px);
            opacity: 1;
          }
          100% {
            transform: translate(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

// Helper function to get node type by stage
function getNodeTypeByStage(stage: number) {
  return {
    color: '#9ca3af',
    icon: '📝',
  };
}

export default DraggableNode;
