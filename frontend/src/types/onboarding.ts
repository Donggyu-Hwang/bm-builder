export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingState {
  currentStep: OnboardingStep;
  responses: OnboardingResponse[];
  loading: boolean;
  error: string | null;
  completed: boolean;
}

export interface OnboardingResponse {
  id?: string;
  user_id?: string;
  step_number: OnboardingStep;
  response: string;
  created_at?: string;
}

export interface OnboardingData {
  step1: string; // 비전
  step2: string; // 타겟
  step3: string; // 현재 단계
}
