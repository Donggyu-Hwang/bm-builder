import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { FocusTrap } from 'focus-trap-react';
import type { OnboardingMode } from '../../types/canvas';

interface CelebrationModalProps {
  isVisible: boolean;
  mode: OnboardingMode;
  onViewNextSteps: () => void;
  onContinueOnboarding: () => void;
  onSwitchToMain: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isVisible,
  mode,
  onViewNextSteps,
  onContinueOnboarding,
  onSwitchToMain,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const hasTriggeredConfetti = useRef(false);

  // Trigger confetti animation on modal open
  useEffect(() => {
    if (isVisible && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;

      // Multi-stage confetti explosion for maximum impact
      const duration = 2000;
      const end = Date.now() + duration;

      // Initial burst from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'],
        disableForReducedMotion: true,
        zIndex: 100,
      });

      // Continuous cascade effect
      const interval = setInterval(() => {
        const timeLeft = end - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          particleCount,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#10B981'],
          disableForReducedMotion: true,
          zIndex: 100,
        });
        confetti({
          particleCount,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3B82F6', '#EF4444'],
          disableForReducedMotion: true,
          zIndex: 100,
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Reset confetti flag when modal closes
  useEffect(() => {
    if (!isVisible) {
      hasTriggeredConfetti.current = false;
    }
  }, [isVisible]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onContinueOnboarding();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onContinueOnboarding]);

  if (!isVisible) return null;

  const isBeginner = mode === 'beginner';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 300ms ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <FocusTrap active={isVisible}>
        <div
          ref={modalRef}
          className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{
            animation: 'slideUpBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
        {/* Noise texture overlay for tactile depth */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient accent bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-green-500 to-blue-500" />

        <div className="relative p-12 text-center">
          {/* Celebration Icon */}
          <div
            className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl"
            style={{
              animation: 'scaleIn 400ms ease-out 100ms both',
            }}
          >
            <span className="text-6xl" role="img" aria-label="Celebration">
              🎉
            </span>
          </div>

          {/* Main Heading - Editorial Typography */}
          <h2
            id="celebration-title"
            className="text-5xl font-black text-gray-900 mb-4 tracking-tight"
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              letterSpacing: '-0.03em',
              animation: 'slideUp 500ms ease-out 200ms both',
            }}
          >
            첫 번째 노드 완성!
          </h2>

          {/* Subheading */}
          <p
            className="text-2xl font-medium text-amber-600 mb-8"
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              animation: 'slideUp 500ms ease-out 300ms both',
            }}
          >
            축하합니다! 🎊
          </p>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 mb-10"
            style={{
              animation: 'slideUp 500ms ease-out 400ms both',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span
              className="text-sm font-bold text-green-700"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              온보딩 완료
            </span>
          </div>

          {/* Contextual Message */}
          <p
            className="text-lg text-gray-700 mb-12 leading-relaxed max-w-md mx-auto"
            style={{
              animation: 'slideUp 500ms ease-out 500ms both',
            }}
          >
            {isBeginner
              ? '훌륭하게 시작하셨어요! 이제 7단계 린스타트업 여정을 계속할 수 있어요'
              : '이미 익숙하시군요! 이제 메인 캔버스의 모든 기능을 사용할 수 있어요'}
          </p>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ animation: 'slideUp 500ms ease-out 600ms both' }}
          >
            {isBeginner ? (
              <>
                {/* View Next Steps Button - Primary CTA */}
                <button
                  onClick={onViewNextSteps}
                  className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 min-w-[200px]"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    다음 단계 보기
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>

                {/* Continue Onboarding Button - Secondary */}
                <button
                  onClick={onContinueOnboarding}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 min-w-[200px]"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  온보딩 모드 계속하기
                </button>
              </>
            ) : (
              <>
                {/* Switch to Main Canvas - Primary CTA */}
                <button
                  onClick={onSwitchToMain}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 min-w-[200px]"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    메인 캔버스로 전환
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>

                {/* Continue Onboarding Button - Secondary */}
                <button
                  onClick={onContinueOnboarding}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 min-w-[200px]"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  계속 온보딩 모드 사용
                </button>
              </>
            )}
          </div>

          {/* Close hint */}
          <p
            className="mt-8 text-xs text-gray-400"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              animation: 'fadeIn 600ms ease-out 700ms both',
            }}
          >
            ESC 키로 닫기
          </p>
        </div>
      </div>
      </FocusTrap>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          [role="dialog"] {
            padding: 0;
          }

          [role="dialog"] > div {
            max-width: 100vw;
            height: 100vh;
            border-radius: 0;
            animation: slideUpMobile 400ms cubic-bezier(0.16, 1, 0.3, 1) !important;
          }

          [role="dialog"] > div > div[style*="padding"] {
            padding: 1.5rem;
            padding-bottom: 6rem;
            overflow-y: auto;
            max-height: calc(100vh - 6rem);
          }

          [role="dialog"] h2 {
            font-size: 2rem !important;
          }

          [role="dialog"] p[style*="text-2xl"] {
            font-size: 1.25rem !important;
          }

          [role="dialog"] .flex.flex-col {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            gap: 0.75rem !important;
            box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
            animation: slideUpMobile 400ms cubic-bezier(0.16, 1, 0.3, 1) !important;
          }

          [role="dialog"] .flex.flex-col button {
            min-height: 48px;
            font-size: 1rem;
          }
        }

        @keyframes slideUpMobile {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationModal;
