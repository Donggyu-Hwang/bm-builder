import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingModeBadge } from './OnboardingModeBadge';
import { AIGuideToggle } from './AIGuideToggle';
import { ProblemDiscovery } from './ProblemDiscovery';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  ONBOARDING_MODE_STORAGE_KEY,
  AI_GUIDE_TOGGLE_STORAGE_KEY,
  type OnboardingMode,
} from '../../types/canvas';
import { ONBOARDING_STORAGE_KEY } from '../../types/onboarding';

interface OnboardingCanvasProps {
  mode: OnboardingMode;
}

interface StoredState {
  selectedOption?: OnboardingMode;
  skipped?: boolean;
  lastVisit: number;
}

export const OnboardingCanvas: React.FC<OnboardingCanvasProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [aiGuideEnabled, setAiGuideEnabled] = useState(true);
  const [nodeCount, setNodeCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [problemAnswers, setProblemAnswers] = useState<Record<number, string>>({});

  // Load AI guide toggle state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AI_GUIDE_TOGGLE_STORAGE_KEY);
      if (stored !== null) {
        setAiGuideEnabled(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load AI guide toggle state:', error);
    }
  }, []);

  // Track node creation (simulated - will be connected to actual canvas)
  const handleNodeCreated = useCallback(() => {
    setNodeCount((prev) => {
      const newCount = prev + 1;

      // Check if onboarding should complete
      if (newCount >= 3) {
        setTimeout(() => setShowCompletionModal(true), 500);
      }

      return newCount;
    });
  }, []);

  const handleAiGuideToggle = useCallback((enabled: boolean) => {
    setAiGuideEnabled(enabled);
  }, []);

  const handleProblemAnswer = useCallback((questionIndex: number, answer: string) => {
    setProblemAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  }, []);

  const handleContinueOnboarding = useCallback(() => {
    setShowCompletionModal(false);
    // User chooses to continue in onboarding mode
    // Reset node count or keep tracking - business decision
  }, []);

  const handleSwitchToMainCanvas = useCallback(() => {
    // Mark onboarding as complete
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const state: StoredState = JSON.parse(stored);
        state.lastVisit = Date.now();
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Failed to update onboarding state:', error);
    }

    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const getModeDescription = (): string => {
    switch (mode) {
      case 'beginner':
        return '더블클릭하여 첫 번째 노드를 생성하세요';
      case 'problem-discovery':
        return 'AI 가이드와 함께 문제를 발굴해보세요';
      case 'team':
        return '팀원들과 함께 협업하세요';
    }
  };

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Header */}
      {!isMobile && (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <OnboardingModeBadge mode={mode} />
              <AIGuideToggle enabled={aiGuideEnabled} onToggle={handleAiGuideToggle} />
            </div>
          </div>
        </header>
      )}

      {/* Main Canvas Area */}
      <main className="relative">
        {/* Canvas placeholder - will be replaced with actual ReactFlow canvas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Help text */}
          {aiGuideEnabled && (
            <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-center">
              <p className="text-lg font-medium text-indigo-900 dark:text-indigo-300">
                💡 {getModeDescription()}
              </p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">
                노드 수: {nodeCount}/3
              </p>
              {/* Demo button to simulate node creation */}
              <button
                onClick={handleNodeCreated}
                className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                노드 추가 (데모)
              </button>
            </div>
          )}

          {/* Mode-specific content */}
          {mode === 'problem-discovery' && aiGuideEnabled && (
            <div className="max-w-2xl mx-auto">
              <ProblemDiscovery onAnswer={handleProblemAnswer} />
            </div>
          )}

          {mode === 'team' && aiGuideEnabled && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    팀 온보딩 팁
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>팀원 초대 링크를 공유하여 협업을 시작하세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>실시간으로 변경사항을 동기화합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>코멘트와 채팅으로 소통하세요</span>
                  </li>
                </ul>
                <button
                  className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled
                  title="팀원 초대 기능은 다음 에픽에서 구현될 예정입니다"
                >
                  팀원 초대 (다음 에픽에서 구현 예정)
                </button>
              </div>
            </div>
          )}

          {/* Canvas placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">캔버스 영역</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  React Flow 캔버스가 여기에 표시됩니다 (다음 스토리에서 구현)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <OnboardingModeBadge mode={mode} />
            <AIGuideToggle enabled={aiGuideEnabled} onToggle={handleAiGuideToggle} />
          </div>
        </div>
      )}
      {/* Add padding for mobile bottom bar */}
      {isMobile && <div className="h-20" />}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">온보딩 완료!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {nodeCount}개의 노드를 생성했습니다. 메인 캔버스로 전환하시겠습니까?
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleContinueOnboarding}
                className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                계속 온보딩 모드 사용
              </button>
              <button
                onClick={handleSwitchToMainCanvas}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                메인 캔버스로 전환
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
