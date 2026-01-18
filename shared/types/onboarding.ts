export type OnboardingStep = 1 | 2 | 3;
export type CurrentStage = 'idea' | 'prototype' | 'mvp' | 'growth';

export interface OnboardingResponse {
  id: string;
  user_id: string;
  step: OnboardingStep;
  vision?: string;
  target_customer?: string;
  current_stage?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingInput {
  vision?: string;
  target_customer?: string;
  current_stage?: CurrentStage;
}
