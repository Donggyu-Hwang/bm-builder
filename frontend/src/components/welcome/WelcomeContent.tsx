import React from 'react';
import type { CurrentStage } from '../../../../shared/types/onboarding.types';

interface WelcomeContentProps {
  userName: string;
  vision: string;
  targetCustomer: string;
  currentStage: CurrentStage;
}

const STAGE_LABELS: Record<CurrentStage, string> = {
  idea: '아이디어 단계',
  prototype: '프로토타입 단계',
  mvp: 'MVP 개발 단계',
  growth: '성장 단계',
};

export const WelcomeContent: React.FC<WelcomeContentProps> = ({
  userName,
  vision,
  targetCustomer,
  currentStage,
}) => {
  const stageLabel = STAGE_LABELS[currentStage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {userName}님, 환영합니다! 🎉
        </h2>
        <p className="text-lg text-gray-600">
          AI 공동 창업자가 되어 기뻐요
        </p>
      </div>

      {/* Personalized Message */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              "{vision}"을 위한 여정을 시작하네요!
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              당신의 타겟인 <span className="text-indigo-600">{targetCustomer}</span>을 위해 AI가 준비되었어요.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              <span className="text-purple-600">{stageLabel}</span>에서 다음 스텝은 무엇일까요?
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">💡 팁:</span> 대시보드에서 AI가 제안하는 우선순위를 확인하고,
          바로 시작할 수 있어요!
        </p>
      </div>
    </div>
  );
};
