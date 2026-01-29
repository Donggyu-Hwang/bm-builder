import React from 'react';
import { FocusTrap } from 'focus-trap-react';

interface NextStepsCardProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps: number;
  nextStepName: string;
  nextStepDescription: string;
  onStartNow: () => void;
  onLater: () => void;
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({
  isVisible,
  currentStep,
  totalSteps,
  nextStepName,
  nextStepDescription,
  onStartNow,
  onLater,
}) => {
  if (!isVisible) return null;

  const progressPercentage = (currentStep / totalSteps) * 100;

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
      aria-labelledby="next-steps-title"
    >
      <FocusTrap active={isVisible}>
        <div
          className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{
            animation: 'slideUpBounce 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient accent bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-green-500 to-blue-500" />

        <div className="relative p-10">
          {/* Header */}
          <div className="mb-8">
            {/* Progress Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-500 mb-6"
              style={{
                animation: 'scaleIn 400ms ease-out 100ms both',
              }}
            >
              <span className="text-2xl" role="img" aria-label="Progress">
                📊
              </span>
              <span
                className="text-sm font-bold text-green-700"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {currentStep}/{totalSteps} 단계 완료
              </span>
            </div>

            {/* Title */}
            <h3
              id="next-steps-title"
              className="text-3xl font-black text-gray-900 mb-3 tracking-tight"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                letterSpacing: '-0.03em',
                animation: 'slideUp 500ms ease-out 200ms both',
              }}
            >
              다음 단계: {nextStepName}
            </h3>

            {/* Progress Bar */}
            <div
              className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
              style={{ animation: 'slideUp 500ms ease-out 300ms both' }}
            >
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                }}
              />
            </div>
          </div>

          {/* Description */}
          <p
            className="text-base text-gray-600 mb-10 leading-relaxed"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              animation: 'slideUp 500ms ease-out 400ms both',
            }}
          >
            {nextStepDescription}
          </p>

          {/* Action Buttons */}
          <div
            className="flex flex-col gap-3"
            style={{ animation: 'slideUp 500ms ease-out 500ms both' }}
          >
            {/* Start Now Button - Primary CTA */}
            <button
              onClick={onStartNow}
              className="group relative w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                지금 시작하기
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

            {/* Later Button - Secondary */}
            <button
              onClick={onLater}
              className="w-full px-6 py-4 bg-white text-gray-600 font-bold rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              나중에
            </button>
          </div>

          {/* Info hint */}
          <p
            className="mt-6 text-xs text-gray-400 text-center"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              animation: 'fadeIn 600ms ease-out 600ms both',
            }}
          >
            나중에 선택 시 우측 상단에서 다시 볼 수 있어요
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

          [role="dialog"] > div > div {
            padding: 1.5rem;
            padding-bottom: 6rem;
            overflow-y: auto;
            max-height: calc(100vh - 6rem);
          }

          [role="dialog"] h3 {
            font-size: 1.75rem !important;
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
            padding: 1rem !important;
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

export default NextStepsCard;
