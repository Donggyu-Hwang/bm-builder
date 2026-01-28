import React from 'react';

interface OnboardingCompletionProps {
  onStartNext: () => void;
  onContinueOnboarding: () => void;
  nodeCount: number;
}

export const OnboardingCompletion: React.FC<OnboardingCompletionProps> = ({
  onStartNext,
  onContinueOnboarding,
  nodeCount,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          첫 번째 노드 완성!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">축하합니다! 훌륭하게 시작하셨어요</p>

        <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-indigo-900 dark:text-indigo-100">
            진행률: {nodeCount}/7 단계 완료
          </p>
          <div className="w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-2 mt-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all"
              style={{ width: `${(nodeCount / 7) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStartNext}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            다음 단계 보기
          </button>
          <button
            onClick={onContinueOnboarding}
            className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            온보딩 모드 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
