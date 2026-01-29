/**
 * NodeTypeModal Component
 *
 * A modal dialog for selecting Lean Startup stage node types.
 * Features progressive disclosure, keyboard navigation, and mobile responsiveness.
 *
 * Design: Tech-brutalist with structured chaos
 * - 3-column grid on desktop
 * - Vertical scroll on mobile
 * - Smooth animations with staggered reveals
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusTrap } from 'focus-trap-react';
import NodeTypeCard from './NodeTypeCard';
import { useProgressiveDisclosure } from '../../hooks/useProgressiveDisclosure';
import { useAppDispatch } from '../../store/hooks';
import { setOnboardingCompleted } from '../../store/slices/onboardingSlice';
import { getNextStageToUnlock } from '../../hooks/useProgressiveDisclosure';
import type { NodeType } from '../../config/nodeTypes';

interface NodeTypeModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when a node type is selected */
  onSelect: (nodeType: NodeType) => void;
  /** Callback when modal is closed */
  onClose: () => void;
}

export const NodeTypeModal: React.FC<NodeTypeModalProps> = ({
  isOpen,
  onSelect,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { visibleNodeTypes, canUnlockNext, unlockedStages } = useProgressiveDisclosure();

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTypeId(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus first card on mount (mobile)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstCard = modalRef.current.querySelector('button');
      if (firstCard && window.innerWidth < 768) {
        (firstCard as HTMLButtonElement).focus();
      }
    }
  }, [isOpen]);

  // Handle node type selection
  const handleSelect = (nodeType: NodeType) => {
    setSelectedTypeId(nodeType.id);
    // Small delay for visual feedback before closing
    setTimeout(() => {
      onSelect(nodeType);
    }, 150);
  };

  // Story 2.1 HIGH-1: Handle "Show More" button to unlock next stage
  const handleShowMore = () => {
    const nextStage = getNextStageToUnlock(unlockedStages);
    if (nextStage) {
      // Unlock all stages for demo purposes
      // In production, this would unlock based on user progress
      dispatch(setOnboardingCompleted());
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={onClose}
      role="presentation"
    >
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            animation: 'slideUpBounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            maxHeight: '90vh',
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Header */}
          <div className="relative z-10 p-6 md:p-8 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="modal-title"
                  className="text-2xl md:text-3xl font-black text-gray-900 mb-2"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    letterSpacing: '-0.03em',
                  }}
                >
                  노드 타입 선택
                </h2>
                <p
                  className="text-gray-600 text-base md:text-lg"
                  style={{
                    fontFamily: 'Pretendard, -apple-system, sans-serif',
                  }}
                >
                  생성할 노드의 스테이지를 선택하세요
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="닫기"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Progress indicator */}
            {canUnlockNext && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {visibleNodeTypes.length}/7 스테이지 표시 중
                </span>
              </div>
            )}
          </div>

          {/* Node Type Cards Grid */}
          <div className="relative z-10 p-6 md:p-8 overflow-y-auto">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              role="listbox"
              aria-label="노드 타입 목록"
            >
              {visibleNodeTypes.map((nodeType, index) => (
                <div
                  key={nodeType.id}
                  className="transform transition-all duration-300"
                  style={{
                    animation: `scaleIn 300ms ease-out ${index * 50}ms both`,
                  }}
                  role="option"
                  aria-selected={selectedTypeId === nodeType.id}
                >
                  <NodeTypeCard
                    nodeType={nodeType}
                    isSelected={selectedTypeId === nodeType.id}
                    onSelect={() => handleSelect(nodeType)}
                  />
                </div>
              ))}
            </div>

            {/* Empty state for no visible types */}
            {visibleNodeTypes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">표시 가능한 노드 타입이 없습니다</p>
              </div>
            )}

            {/* Story 2.1 HIGH-1: "Show More" button to unlock next stages */}
            {canUnlockNext && visibleNodeTypes.length < 7 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleShowMore}
                  className="
                    group px-6 py-3
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    hover:from-blue-600 hover:to-indigo-700
                    text-white font-bold rounded-lg
                    shadow-lg hover:shadow-xl
                    transform hover:-translate-y-0.5
                    transition-all duration-200
                    flex items-center gap-2
                  "
                  style={{ fontFamily: 'Pretendard, -apple-system, sans-serif' }}
                >
                  <span>더 보기</span>
                  <svg
                    className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Footer with keyboard hint */}
          <div
            className="relative z-10 px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span
                  className="flex items-center gap-1"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <kbd
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    aria-label="Escape 키"
                  >
                    ESC
                  </kbd>
                  닫기
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <kbd
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    aria-label="Tab 키"
                  >
                    Tab
                  </kbd>
                  이동
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <kbd
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    aria-label="Enter 키"
                  >
                    Enter
                  </kbd>
                  선택
                </span>
              </div>
            </div>
          </div>

          {/* Global animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes slideUpBounce {
              0% {
                opacity: 0;
                transform: translateY(40px) scale(0.95);
              }
              50% {
                transform: translateY(-8px) scale(1.02);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }

            /* Mobile responsive adjustments */
            @media (max-width: 768px) {
              div[role="dialog"] {
                max-height: 100vh;
                border-radius: 0;
              }
            }
          `}</style>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
};

export default NodeTypeModal;
