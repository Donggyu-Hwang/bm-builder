import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OptionCard } from './OptionCard';
import { ONBOARDING_STORAGE_KEY, type UserOption } from '../../types/onboarding';

// Constants
const AUTO_ADVANCE_DELAY_MS = 2000;

interface StoredState {
  selectedOption?: UserOption;
  skipped?: boolean;
  lastVisit: number;
}

const OPTIONS: Array<{
  id: UserOption;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'idea-exists',
    title: '이미 스타트업 아이디어가 있어요',
    description: '아이디어 입력으로 바로 이동',
    icon: '💡',
  },
  {
    id: 'no-idea',
    title: '아직 아이디어가 없어요',
    description: '문제 발굴 가이드로 이동',
    icon: '🔍',
  },
  {
    id: 'team',
    title: '팀과 함께하고 있어요',
    description: '팀 온보딩 가이드로 이동',
    icon: '👥',
  },
];

export const AIGreeting: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [showPreviousSelection, setShowPreviousSelection] = useState(false);
  const [previousOption, setPreviousOption] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Safe navigation wrapper with error handling
  const safeNavigate = useCallback(
    (path: string) => {
      try {
        navigate(path, { replace: true });
      } catch (error) {
        console.error('Navigation failed:', error);
        setErrorMessage('페이지 이동에 실패했습니다. 다시 시도해 주세요.');
      }
    },
    [navigate]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, []);

  const handleOptionSelect = useCallback(
    (optionId: UserOption) => {
      try {
        // Cancel auto-advance if user manually selects
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }

        // Store selection in localStorage
        const state: StoredState = {
          selectedOption: optionId,
          lastVisit: Date.now(),
        };
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));

        // Route to appropriate onboarding mode
        safeNavigate('/onboarding');
      } catch (error) {
        console.error('Failed to store selection:', error);
        setErrorMessage('선택 사항을 저장하는 데 실패했습니다. 계속 진행합니다.');
        // Still navigate even if storage fails
        safeNavigate('/onboarding');
      }
    },
    [safeNavigate]
  );

  const handleSkip = useCallback(() => {
    try {
      // Cancel auto-advance if user skips
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      const state: StoredState = {
        skipped: true,
        lastVisit: Date.now(),
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
      safeNavigate('/dashboard');
    } catch (error) {
      console.error('Failed to store skip preference:', error);
      setErrorMessage('건너뛰기 설정을 저장하는 데 실패했습니다. 계속 진행합니다.');
      safeNavigate('/dashboard');
    }
  }, [safeNavigate]);

  // Check for previous user state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const state: StoredState = JSON.parse(stored);

        if (state.skipped) {
          // Auto-skip to main canvas
          safeNavigate('/dashboard');
          return;
        }

        if (state.selectedOption) {
          // Show previous selection message
          const option = OPTIONS.find((opt) => opt.id === state.selectedOption);
          if (option) {
            setPreviousOption(option.title);
            setShowPreviousSelection(true);

            // Auto-advance after delay, but store timer ref for cleanup
            autoAdvanceTimerRef.current = setTimeout(() => {
              handleOptionSelect(state.selectedOption!);
            }, AUTO_ADVANCE_DELAY_MS);
          }
        }
      }
    } catch (error) {
      console.error('Failed to read localStorage:', error);
      setErrorMessage('이전 설정을 불러오는 데 실패했습니다.');
    }
  }, [safeNavigate, handleOptionSelect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-300 text-center">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-2 text-xs text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 block mx-auto"
            >
              닫기
            </button>
          </div>
        )}

        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="온보딩 건너뛰기"
          >
            건너뛰기
          </button>
        </div>

        {/* AI Greeting */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            안녕하세요! AI Co-Founder입니다 🤖
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            어떤 상태로 시작하시겠습니까?
          </p>
        </div>

        {/* Previous Selection Toast */}
        {showPreviousSelection && previousOption && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-center">
            <p className="text-sm sm:text-base text-indigo-900 dark:text-indigo-300">
              이전에 선택한 옵션: {previousOption}
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
              {AUTO_ADVANCE_DELAY_MS / 1000}초 후 자동으로 진행합니다...
            </p>
            <button
              onClick={() => {
                if (autoAdvanceTimerRef.current) {
                  clearTimeout(autoAdvanceTimerRef.current);
                  autoAdvanceTimerRef.current = null;
                }
                setShowPreviousSelection(false);
              }}
              className="mt-2 text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 underline"
            >
              취소하고 직접 선택하기
            </button>
          </div>
        )}

        {/* Offline Notification */}
        {!isOnline && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-300 text-center">
              오프라인 모드로 작동 중입니다
            </p>
          </div>
        )}

        {/* Option Cards - Horizontal on desktop, vertical on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              id={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              onSelect={handleOptionSelect}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-500">
          <p>선택한 옵션은 다음 방문 때 자동으로 적용됩니다</p>
        </div>
      </div>
    </div>
  );
};
