import React, { useState, useEffect } from 'react';

interface AIQuestionModeProps {
  onQuestionSubmit: (answer: string) => void;
  onSkip: () => void;
}

export const AIQuestionMode: React.FC<AIQuestionModeProps> = ({ onQuestionSubmit, onSkip }) => {
  const [countdown, setCountdown] = useState(3);
  const [isStarted, setIsStarted] = useState(false);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (!isStarted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isStarted) {
      setIsStarted(true);
    }
  }, [countdown, isStarted]);

  const handleSubmit = () => {
    if (answer.trim()) {
      onQuestionSubmit(answer);
    }
  };

  if (!isStarted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI 질문 모드</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            어떤 스타트업 아이디어를 가지고 계신가요? 간단히 설명해주세요
          </p>
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            {countdown}초 후 자동으로 시작됩니다
          </div>
          <button
            onClick={() => setIsStarted(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            지금 시작하기
          </button>
          <button
            onClick={onSkip}
            className="ml-4 px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            건너뛰기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="text-4xl mb-2">💡</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          질문: 어떤 스타트업 아이디어를 가지고 계신가요?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          간단히 설명해주시면 AI가 첫 번째 노드를 생성해드릴게요
        </p>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="예: 배달 음식을 주문하는 직장인들을 위한 건강한 식사 구독 서비스"
        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
        rows={4}
      />

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          노드 생성
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
};
