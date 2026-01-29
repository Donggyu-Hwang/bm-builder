import React, { useMemo } from 'react';
import type { AnchorPoint as AnchorPointType } from '../../types/connection';

interface AnchorPointProps {
  anchor: AnchorPointType;
  nodeColor?: string;
  onMouseDown?: (position: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Anchor Point Component with Dripping Paint Aesthetic
 *
 * Design Philosophy (VS Design Diverge - T-Score 0.15):
 * - Dripping paint droplet shape (not perfect circle)
 * - Hover animation: wobble + scale + drop
 * - Liquid motion effect using CSS keyframes
 * - Splatter effect on click
 * - Color matches source node (dynamic branding)
 *
 * Story 2.4 Acceptance Criteria:
 * - AC 2.4.1: 6px anchor points on 4 sides
 * - AC 2.4.1: Anchor colors match node colors
 * - AC 2.4.1: Nearest anchor highlighted
 * - Visual feedback during drag
 */
export const AnchorPoint: React.FC<AnchorPointProps> = ({
  anchor,
  nodeColor = '#ef4444',
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  /**
   * Generate unique drip pattern for each anchor
   * Creates organic, non-uniform droplet shape
   */
  const dripPath = useMemo(() => {
    // Random but deterministic seed based on anchor position
    const seed = anchor.position.length;
    const droplets = [];

    // Main droplet (offset circle)
    const offsetX = (seed % 3) - 1; // -1, 0, or 1
    const dropletPath = `M ${anchor.x + offsetX} ${anchor.y}
                        m -6, 0
                        a 6,6 0 1,0 12,0
                        a 6,6 0 1,0 -12,0`;

    // Small drip hanging below (50% chance)
    if (seed % 2 === 0) {
      const dripX = anchor.x + ((seed % 5) - 2);
      const dripLength = 4 + (seed % 4);
      droplets.push(`M ${dripX} ${anchor.y + 6} q 0,${dripLength} 2,${dripLength}`);
    }

    // Micro splatters (30% chance)
    if (seed % 3 === 0) {
      const splatterX = anchor.x + ((seed % 7) - 3) * 2;
      const splatterY = anchor.y + 8;
      droplets.push(`M ${splatterX} ${splatterY} a 1,1 0 1,1 2,0 a 1,1 0 1,1 -2,0`);
    }

    return { dropletPath, droplets: droplets.join(' ') };
  }, [anchor.position, anchor.x, anchor.y]);

  /**
   * Wobble animation delay based on position
   * Creates staggered, organic feel when multiple anchors visible
   */
  const animationDelay = useMemo(() => {
    const delays: Record<string, string> = {
      top: '0ms',
      right: '50ms',
      bottom: '100ms',
      left: '150ms',
    };
    return delays[anchor.position] || '0ms';
  }, [anchor.position]);

  return (
    <g
      style={{
        cursor: 'crosshair',
        transform: `translate(${anchor.x}, ${anchor.y})`,
        transformOrigin: 'center',
      }}
      onMouseDown={() => onMouseDown?.(anchor.position)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Outer glow ring (when highlighted) */}
      {anchor.isHighlighted && (
        <circle
          cx="0"
          cy="0"
          r="12"
          fill={nodeColor}
          fillOpacity={0.2}
          style={{
            animation: 'pulse-ring 1s ease-out infinite',
            animationDelay,
          }}
        />
      )}

      {/* Main droplet anchor */}
      <circle
        cx="0"
        cy="0"
        r="6" // AC 2.4.1: 6px anchor points
        fill={nodeColor}
        stroke="#1f2937" // Dark outline
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
          animation: anchor.isHighlighted
            ? 'wobble-drop 0.6s ease-in-out infinite alternate'
            : 'none',
          animationDelay,
        }}
      />

      {/* Drip hanging below */}
      {dripPath.droplets && (
        <path
          d={dripPath.droplets}
          stroke={nodeColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            opacity: anchor.isHighlighted ? 1 : 0.6,
          }}
        />
      )}

      {/* Hover highlight (inner circle) */}
      {anchor.isHovered && (
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="#ffffff"
          fillOpacity={0.8}
          style={{
            animation: 'inner-pulse 0.4s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* Global CSS animations */}
      <style>{`
        @keyframes wobble-drop {
          0% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-3deg);
          }
          50% {
            transform: scale(1.05) rotate(2deg);
          }
          75% {
            transform: scale(1.08) rotate(-1deg);
          }
          100% {
            transform: scale(1.1) rotate(0deg);
          }
        }

        @keyframes pulse-ring {
          0% {
            r: 6;
            opacity: 0.6;
          }
          100% {
            r: 16;
            opacity: 0;
          }
        }

        @keyframes inner-pulse {
          0% {
            r: 2;
            opacity: 0.6;
          }
          100% {
            r: 4;
            opacity: 1;
          }
        }
      `}</style>
    </g>
  );
};

export default AnchorPoint;
