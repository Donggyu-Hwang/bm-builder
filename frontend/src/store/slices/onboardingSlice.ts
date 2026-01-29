import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OnboardingMode } from '../../types/canvas';

export interface OnboardingState {
  mode: OnboardingMode;
  completed: boolean;
  nodesCompleted: number;
  progressiveDisclosureEnabled: boolean;
  unlockedStages: number[];
  showCelebrationModal: boolean;
  showNextStepsCard: boolean;
  firstNodeCompletedAt: number | null;
  celebrationShown: boolean;
}

const initialState: OnboardingState = {
  mode: 'beginner',
  completed: false,
  nodesCompleted: 0,
  progressiveDisclosureEnabled: true,
  unlockedStages: [1, 2, 3], // Onboarding mode: only first 3 stages
  showCelebrationModal: false,
  showNextStepsCard: false,
  firstNodeCompletedAt: null,
  celebrationShown: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingMode: (state, action: PayloadAction<OnboardingMode>) => {
      state.mode = action.payload;
    },
    setOnboardingCompleted: (state) => {
      state.completed = true;
      state.progressiveDisclosureEnabled = false;
      state.unlockedStages = [1, 2, 3, 4, 5, 6, 7]; // Unlock all stages
    },
    incrementNodesCompleted: (state) => {
      state.nodesCompleted += 1;
    },
    setNodesCompleted: (state, action: PayloadAction<number>) => {
      state.nodesCompleted = action.payload;
    },
    showCelebration: (state) => {
      state.showCelebrationModal = true;
      state.celebrationShown = true;
      if (!state.firstNodeCompletedAt) {
        state.firstNodeCompletedAt = Date.now();
      }
    },
    hideCelebration: (state) => {
      state.showCelebrationModal = false;
    },
    showNextSteps: (state) => {
      state.showNextStepsCard = true;
    },
    hideNextSteps: (state) => {
      state.showNextStepsCard = false;
    },
    resetOnboarding: () => initialState,
    transitionToMainCanvas: (state) => {
      state.completed = true;
      state.progressiveDisclosureEnabled = false;
      state.unlockedStages = [1, 2, 3, 4, 5, 6, 7];
      state.showCelebrationModal = false;
      state.showNextStepsCard = false;
    },
  },
});

export const {
  setOnboardingMode,
  setOnboardingCompleted,
  incrementNodesCompleted,
  setNodesCompleted,
  showCelebration,
  hideCelebration,
  showNextSteps,
  hideNextSteps,
  resetOnboarding,
  transitionToMainCanvas,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

// Selectors
export const selectOnboardingMode = (state: { onboarding: OnboardingState }) =>
  state.onboarding.mode;
export const selectOnboardingCompleted = (state: { onboarding: OnboardingState }) =>
  state.onboarding.completed;
export const selectNodesCompleted = (state: { onboarding: OnboardingState }) =>
  state.onboarding.nodesCompleted;
export const selectProgressiveDisclosureEnabled = (state: { onboarding: OnboardingState }) =>
  state.onboarding.progressiveDisclosureEnabled;
export const selectUnlockedStages = (state: { onboarding: OnboardingState }) =>
  state.onboarding.unlockedStages;
export const selectShowCelebrationModal = (state: { onboarding: OnboardingState }) =>
  state.onboarding.showCelebrationModal;
export const selectShowNextStepsCard = (state: { onboarding: OnboardingState }) =>
  state.onboarding.showNextStepsCard;
