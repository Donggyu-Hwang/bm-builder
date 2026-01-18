import type { OnboardingInput, CurrentStage } from '../../../../shared/types/onboarding.types';

export const OnboardingStep1 = ({ vision, onChange }: { vision: string; onChange: (input: OnboardingInput) => void }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-900">당신의 비전은 무엇인가요?</h2>
    <p className="text-gray-600">당신이 실현하고 싶은 비즈니스나 프로젝트에 대해 설명해주세요</p>
    <textarea
      value={vision}
      onChange={(e) => onChange({ vision: e.target.value })}
      placeholder="예: 스타트업을 위한 AI 기반 비즈니스 모델 생성 플랫폼"
      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
      autoFocus
    />
    <p className="text-sm text-gray-500">최소 10자 이상 입력해주세요</p>
  </div>
);

export const OnboardingStep2 = ({ targetCustomer, onChange }: { targetCustomer: string; onChange: (input: OnboardingInput) => void }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-900">타겟 고객은 누구인가요?</h2>
    <p className="text-gray-600">당신의 비즈니스나 서비스를 이용할 주요 고객을 설명해주세요</p>
    <textarea
      value={targetCustomer}
      onChange={(e) => onChange({ target_customer: e.target.value })}
      placeholder="예: 한국의 초기 창업자들, 특히 기술 분야의 예비 창업가"
      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
      autoFocus
    />
    <p className="text-sm text-gray-500">최소 10자 이상 입력해주세요</p>
  </div>
);

const STAGE_OPTIONS: { value: CurrentStage; label: string }[] = [
  { value: 'idea', label: '아이디어 단계' },
  { value: 'prototype', label: '프로토타입 단계' },
  { value: 'mvp', label: 'MVP 개발 단계' },
  { value: 'growth', label: '성장 단계' },
];

export const OnboardingStep3 = ({ currentStage, onChange }: { currentStage?: CurrentStage; onChange: (input: OnboardingInput) => void }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-gray-900">현재 어떤 단계인가요?</h2>
    <p className="text-gray-600">현재 프로젝트나 비즈니스의 진행 단계를 선택해주세요</p>
    <div className="space-y-3">
      {STAGE_OPTIONS.map((option) => (
        <label
          key={option.value}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
            currentStage === option.value
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name="current_stage"
            value={option.value}
            checked={currentStage === option.value}
            onChange={(e) => onChange({ current_stage: e.target.value as CurrentStage })}
            className="w-4 h-4 text-indigo-600"
          />
          <span className="ml-3 text-gray-900">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);
