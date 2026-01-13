import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OnboardingState, OnboardingResponse, OnboardingStep } from '../../types/onboarding';
import * as onboardingApi from '../../api/onboardingApi';

const initialState: OnboardingState = {
  currentStep: 1,
  responses: [],
  loading: false,
  error: null,
  completed: false,
};

// Async thunks
export const saveResponse = createAsyncThunk(
  'onboarding/saveResponse',
  async ({ step, response }: { step: OnboardingStep; response: string }, { rejectWithValue }) => {
    try {
      const data = await onboardingApi.saveResponse(step, response);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  }
);

export const getResponses = createAsyncThunk(
  'onboarding/getResponses',
  async (_, { rejectWithValue }) => {
    try {
      const responses = await onboardingApi.getResponses();
      return responses;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '데이터를 가져오는데 실패했습니다.');
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  'onboarding/completeOnboarding',
  async (_, { rejectWithValue }) => {
    try {
      await onboardingApi.completeOnboarding();
      return;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '완료 처리에 실패했습니다.');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOnboarding: () => initialState,
  },
  extraReducers: (builder) => {
    // saveResponse
    builder
      .addCase(saveResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveResponse.fulfilled, (state, action) => {
        state.loading = false;
        // Update or add response
        const existingIndex = state.responses.findIndex(
          (r) => r.step_number === action.payload.step_number
        );
        if (existingIndex >= 0) {
          state.responses[existingIndex] = action.payload;
        } else {
          state.responses.push(action.payload);
        }
      })
      .addCase(saveResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getResponses
    builder
      .addCase(getResponses.fulfilled, (state, action) => {
        state.responses = action.payload;
        // Determine current step based on responses
        if (state.responses.length === 0) {
          state.currentStep = 1;
        } else {
          const maxStep = Math.max(...state.responses.map((r) => r.step_number));
          state.currentStep = (maxStep < 3 ? (maxStep + 1) as OnboardingStep : 3);
        }
      });

    // completeOnboarding
    builder
      .addCase(completeOnboarding.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.loading = false;
        state.completed = true;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentStep, clearError, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;

// Selectors
export const selectOnboardingCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep;
export const selectOnboardingResponses = (state: { onboarding: OnboardingState }) => state.onboarding.responses;
export const selectOnboardingLoading = (state: { onboarding: OnboardingState }) => state.onboarding.loading;
export const selectOnboardingCompleted = (state: { onboarding: OnboardingState }) => state.onboarding.completed;
