import React, { useState } from 'react';

interface ProblemDiscoveryProps {
  onAnswer: (questionIndex: number, answer: string) => void;
  className?: string;
}

const QUESTIONS = [
  {
    id: 1,
    text: '어떤 분야에서 문제를 발견하고 싶으신가요?',
    placeholder: '예: 교육, 의료, 소매, IT 등...',
  },
  {
    id: 2,
    text: '본인이나 주변에서 겪은 불편한 점이 있나요?',
    placeholder: '일상생활에서 불편했던 경험을 말씀해 주세요...',
  },
  {
    id: 3,
    text: '해결하고 싶은 특정 문제가 있나요?',
    placeholder: '구체적으로 해결하고 싶은 문제를 설명해 주세요...',
  },
];

export const ProblemDiscovery: React.FC<ProblemDiscoveryProps> = ({ onAnswer, className = '' }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerChange = (questionId: number, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    onAnswer(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 가이드</h3>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {QUESTIONS.map((q, index) => (
            <div
              key={q.id}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= currentQuestion ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              aria-label={`질문 ${index + 1} ${index <= currentQuestion ? '진행 중' : '대기 중'}`}
            />
          ))}
        </div>

        {/* Question */}
        <div className="mb-6">
          <label
            htmlFor={`question-${currentQ.id}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            질문 {currentQuestion + 1}/{QUESTIONS.length}
          </label>
          <p className="text-lg text-gray-900 dark:text-white mb-4">{currentQ.text}</p>
          <textarea
            id={`question-${currentQ.id}`}
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
            placeholder={currentQ.placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            aria-describedby="answer-help"
          />
          <p id="answer-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            답변은 AI가 맞춤형 가이드를 제공하는 데 사용됩니다.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          {currentQuestion < QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              다음
            </button>
          ) : (
            <button
              onClick={() => {
                /* Will be handled by parent */
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
