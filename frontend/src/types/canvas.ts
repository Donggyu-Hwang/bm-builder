// Canvas and Onboarding Type Definitions

export type OnboardingMode = 'beginner' | 'problem-discovery' | 'team';

export interface OnboardingState {
  mode: OnboardingMode;
  aiGuideEnabled: boolean;
  nodeCount: number;
  completed: boolean;
}

export interface Node {
  id: string;
  type: string;
  stage: number;
  x: number;
  y: number;
  content: string;
  completed: boolean;
}

export interface ProgressiveDisclosureState {
  unlockedStages: number[];
  showAll: boolean;
}
