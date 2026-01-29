import React, { useState, useEffect } from 'react';
import { FocusTrap } from 'focus-trap-react';

interface AutoTransitionModalProps {
  isVisible: boolean;
  countdownSeconds?: number;
  onCancel: () => void;
  onTransition: () => void;
}

export const AutoTransitionModal: React.FC<AutoTransitionModalProps> = ({
  isVisible,
  countdownSeconds = 2,
  onCancel,
  onTransition,
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(countdownSeconds);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Trigger transition after countdown
          setTimeout(() => {
            onTransition();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, countdownSeconds, onTransition]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 300ms ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-transition-title"
    >
      <FocusTrap active={isVisible}>
        <div
          className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-10 text-center"
          style={{
            animation: 'scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
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

        {/* Progress Ring */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - countdown / countdownSeconds)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl font-black text-gray-900"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                letterSpacing: '-0.03em',
              }}
            >
              {countdown}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          id="auto-transition-title"
          className="text-2xl font-black text-gray-900 mb-3 tracking-tight"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            letterSpacing: '-0.03em',
          }}
        >
          온보딩 완료!
        </h3>

        {/* Message */}
        <p className="text-base text-gray-600 mb-8 leading-relaxed">
          이제 메인 캔버스로 자동 전환됩니다
        </p>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          취소
        </button>
      </div>
      </FocusTrap>

      {/* Global Styles */}
      <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
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

            [role="dialog"] button {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              width: 100%;
              min-height: 56px;
              border-radius: 0;
              border: none;
              border-top: 1px solid rgba(0, 0, 0, 0.1);
              box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
              animation: slideUpMobile 400ms cubic-bezier(0.16, 1, 0.3, 1) !important;
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

export default AutoTransitionModal;
