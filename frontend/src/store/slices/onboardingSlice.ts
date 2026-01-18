import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { OnboardingInput, OnboardingResponse } from '../../../../shared/types/onboarding.types';
import { onboardingApi } from '../../api/onboardingApi';

interface OnboardingState {
  currentStep: 1 | 2 | 3;
  responses: OnboardingInput;
  loading: boolean;
  error: string | null;
  completed: boolean;
}

const initialState: OnboardingState = {
  currentStep: 1,
  responses: {},
  loading: false,
  error: null,
  completed: false,
};

// Async thunks
export const loadOnboarding = createAsyncThunk<
  OnboardingResponse,
  void,
  { rejectValue: string }
>(
  'onboarding/loadOnboarding',
  async (_, { rejectWithValue }) => {
    const result = await onboardingApi.getOnboarding();

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return result.data;
  }
);

export const saveOnboardingStep = createAsyncThunk<
  OnboardingResponse,
  { step: 1 | 2 | 3; input: OnboardingInput },
  { rejectValue: string }
>(
  'onboarding/saveOnboardingStep',
  async ({ step, input }, { rejectWithValue }) => {
    const result = await onboardingApi.saveStep(step, input);

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return result.data;
  }
);

export const completeOnboarding = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'onboarding/completeOnboarding',
  async (_, { rejectWithValue }) => {
    const result = await onboardingApi.completeOnboarding();

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return;
  }
);

export const resetOnboarding = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'onboarding/resetOnboarding',
  async (_, { rejectWithValue }) => {
    const result = await onboardingApi.resetOnboarding();

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return;
  }
);

// Slice
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.currentStep = action.payload;
    },
    updateResponse: (state, action: PayloadAction<OnboardingInput>) => {
      state.responses = { ...state.responses, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadOnboarding
      .addCase(loadOnboarding.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadOnboarding.fulfilled, (state, action) => {
        state.currentStep = action.payload.step;
        state.responses = {
          vision: action.payload.vision,
          target_customer: action.payload.target_customer,
          current_stage: action.payload.current_stage,
        };
        state.completed = !!action.payload.completed_at;
        state.loading = false;
      })
      .addCase(loadOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // saveOnboardingStep
      .addCase(saveOnboardingStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveOnboardingStep.fulfilled, (state, action) => {
        state.currentStep = action.payload.step;
        state.responses = {
          vision: action.payload.vision,
          target_customer: action.payload.target_customer,
          current_stage: action.payload.current_stage,
        };
        state.loading = false;
      })
      .addCase(saveOnboardingStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // completeOnboarding
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.completed = true;
      })

      // resetOnboarding
      .addCase(resetOnboarding.fulfilled, () => {
        return initialState;
      });
  },
});

export const { setCurrentStep, updateResponse, clearError } = onboardingSlice.actions;

// Selectors
export const selectOnboarding = (state: { onboarding: OnboardingState }) => state.onboarding;

export default onboardingSlice.reducer;
