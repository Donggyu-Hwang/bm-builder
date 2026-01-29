/**
 * NodeTypeCard Component
 *
 * A visually striking card component representing a Lean Startup stage.
 * Features tech-brutalist design with bold colors, sharp typography, and subtle textures.
 *
 * Design Principles:
 * - High contrast colors meeting WCAG 2.1 AA standards
 * - Subtle noise texture overlay for depth
 * - Hover animations with smooth transitions
 * - Clear focus indicators for keyboard navigation
 * - Mobile-responsive with 44px minimum touch targets
 */

import React, { useRef, useEffect } from 'react';
import type { NodeType } from '../../config/nodeTypes';

interface NodeTypeCardProps {
  /** Node type configuration */
  nodeType: NodeType;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Click handler for selection */
  onSelect: () => void;
  /** Unique ID for accessibility */
  id?: string;
}

export const NodeTypeCard: React.FC<NodeTypeCardProps> = ({
  nodeType,
  isSelected = false,
  onSelect,
  id = `node-type-${nodeType.id}`,
}) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  // Focus management for accessibility
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isSelected]);

  return (
    <button
      ref={cardRef}
      id={id}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`
        group relative
        w-full h-auto min-h-[120px] md:min-h-[140px]
        p-6 rounded-lg
        text-left
        transition-all duration-300 ease-out
        transform hover:-translate-y-1
        focus:outline-none
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: nodeType.color,
        // Tech-brutalist shadow: layered and directional
        boxShadow: isSelected
          ? `0 0 0 4px #3b82f6, 8px 8px 0px 0px rgba(0, 0, 0, 0.9), -8px -8px 0px 0px rgba(255, 255, 255, 0.1)`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
      }}
      aria-pressed={isSelected}
      aria-label={`${nodeType.label} 스테이지 선택${isSelected ? ', 선택됨' : ''}`}
    >
      {/* Noise texture overlay for tactile depth */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none rounded-lg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Header: Icon + Stage Number */}
        <div className="flex items-start justify-between gap-4">
          {/* Icon */}
          <span
            className="text-4xl md:text-5xl filter drop-shadow-lg"
            style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}
            role="img"
            aria-label={`${nodeType.label} 아이콘`}
          >
            {nodeType.icon}
          </span>

          {/* Stage Badge - Brutalist typography */}
          <div
            className="px-3 py-1 rounded text-white font-bold text-sm md:text-base tracking-tighter"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              letterSpacing: '-0.05em',
            }}
          >
            STAGE {nodeType.stage}
          </div>
        </div>

        {/* Label - Tight tracking for impact */}
        <h3
          className="text-white font-black text-xl md:text-2xl leading-none"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            letterSpacing: '-0.03em',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          {nodeType.label}
        </h3>

        {/* Description - Open leading for readability */}
        <p
          className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-2"
          style={{
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          }}
        >
          {nodeType.description}
        </p>
      </div>

      {/* Hover effect: Bottom accent bar */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1.5
          transform scale-x-0 group-hover:scale-x-100
          transition-transform duration-300 ease-out
        `}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      />

      {/* Focus indicator for keyboard navigation */}
      <style>{`
        #${id}:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px #3b82f6, 8px 8px 0px 0px rgba(0, 0, 0, 0.9);
        }

        @media (prefers-reduced-motion: reduce) {
          #${id} {
            transform: none !important;
          }
        }
      `}</style>
    </button>
  );
};

export default NodeTypeCard;
