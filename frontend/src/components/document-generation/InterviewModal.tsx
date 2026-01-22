/**
 * Interview Modal Component
 * Modal for conducting AI interview to gather document information
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveQuestionAnswer,
  completeSessionInterview,
  setCurrentQuestion,
  setShowExitConfirmation,
  selectCurrentSession,
  selectSessionLoading,
  resetSession,
} from '../../store/slices/documentGenerationSlice';
import { RootState, AppDispatch } from '../../store/store';

interface InterviewModalProps {
  sessionId: string;
  templateName: string;
  onClose: () => void;
}

const InterviewModal = ({ sessionId, templateName, onClose }: InterviewModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSession = useSelector(selectCurrentSession);
  const loading = useSelector(selectSessionLoading);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions] = useState<string[]>([
    '사업의 핵심 가치나 미션은 무엇인가요?',
    '타겟 고객층은 누구인가요?',
    '경쟁사와의 차별점은 무엇인가요?',
    '현재 사업 단계는 어떻게 되나요?',
    '향후 1년간의 목표는 무엇인가요?',
  ]);

  const currentQuestion = currentSession.currentQuestion || 1;
  const totalQuestions = questions.length;

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    try {
      await dispatch(
        saveQuestionAnswer({
          sessionId,
          request: {
            question_number: currentQuestion,
            answer: currentAnswer,
          },
        })
      ).unwrap();

      if (currentQuestion < totalQuestions) {
        // Move to next question
        dispatch(setCurrentQuestion(currentQuestion + 1));
        setCurrentAnswer('');
      } else {
        // Complete interview
        await dispatch(completeSessionInterview(sessionId)).unwrap();
        dispatch(setShowExitConfirmation(true));
      }
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  // Handle skip question
  const handleSkipQuestion = async () => {
    if (currentQuestion < totalQuestions) {
      dispatch(setCurrentQuestion(currentQuestion + 1));
      setCurrentAnswer('');
    } else {
      // Complete interview even if skipped
      await dispatch(completeSessionInterview(sessionId)).unwrap();
      dispatch(setShowExitConfirmation(true));
    }
  };

  // Handle close
  const handleClose = () => {
    dispatch(setShowExitConfirmation(true));
  };

  // Progress percentage
  const progressPercentage = ((currentQuestion - 1) / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-0 sm:m-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{templateName}</h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                질문 {currentQuestion} / {totalQuestions}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-blue-200 transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4 bg-blue-800/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm sm:text-base font-medium text-slate-700 dark:text-gray-200 mb-2">
              {questions[currentQuestion - 1]}
            </label>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              이 질문은 건너뛸 수 있지만, 가능한 자세히 답변해 주시면 더 좋은 문서가 생성됩니다.
            </p>
          </div>

          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="답변을 입력하세요..."
            rows={6}
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={loading}
          />

          {/* Actions */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={handleSkipQuestion}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 transition-colors order-2 sm:order-1"
              disabled={loading}
            >
              건너뛰기
            </button>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base border border-slate-300 dark:border-gray-600 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                중단하기
              </button>
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !currentAnswer.trim()}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '저장 중...' : currentQuestion < totalQuestions ? '다음' : '완료'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
