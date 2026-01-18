export type CurrentStage = 'idea' | 'prototype' | 'mvp' | 'growth';

export interface OnboardingResponse {
  id: string;
  user_id: string;
  step: 1 | 2 | 3;
  vision?: string;
  target_customer?: string;
  current_stage?: CurrentStage;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingInput {
  vision?: string;
  target_customer?: string;
  current_stage?: CurrentStage;
}

// API Error type
export interface ApiError {
  code: string;
  message: string;
}

// Discriminated union types for API responses (per project-context.md)
export type OnboardingApiResponse = { success: true; data: OnboardingResponse } | { success: false; error: ApiError };
export type OnboardingSaveResponse = { success: true; data: OnboardingResponse } | { success: false; error: ApiError };
export type OnboardingCompleteResponse = { success: true; data: { message: string } } | { success: false; error: ApiError };
export type OnboardingResetResponse = { success: true; data: { message: string } } | { success: false; error: ApiError };

