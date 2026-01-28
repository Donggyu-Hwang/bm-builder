/**
 * Onboarding type definitions
 * @module onboarding
 */

export type UserOption = 'idea-exists' | 'no-idea' | 'team';

export interface OnboardingState {
  selectedOption?: UserOption;
  skipped?: boolean;
  lastVisit: number;
}

export interface OptionCardProps {
  id: UserOption;
  title: string;
  description: string;
  icon: string;
  onSelect: (option: UserOption) => void;
}

export const ONBOARDING_STORAGE_KEY = 'bm_builder_onboarding';
