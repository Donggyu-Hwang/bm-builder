import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PrioritiesState, Priority, PriorityItem } from '../../types/priorities';
import * as prioritiesApi from '../../api/prioritiesApi';

const initialState: PrioritiesState = {
  items: [],
  loading: false,
  generating: false,
  error: null,
  streamingResponse: '',
};

// Async thunks
export const generatePriorities = createAsyncThunk(
  'priorities/generate',
  async (onboardingResponses: string, { rejectWithValue }) => {
    try {
      const priorities = await prioritiesApi.generatePriorities(onboardingResponses);
      return priorities;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '생성에 실패했습니다.');
    }
  }
);

export const getPriorities = createAsyncThunk(
  'priorities/get',
  async (_, { rejectWithValue }) => {
    try {
      const priorities = await prioritiesApi.getPriorities();
      return priorities;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '데이터를 가져오는데 실패했습니다.');
    }
  }
);

export const updatePriorities = createAsyncThunk(
  'priorities/update',
  async (priorities: PriorityItem[], { rejectWithValue }) => {
    try {
      const updated = await prioritiesApi.updatePriorities(priorities);
      return updated;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '업데이트에 실패했습니다.');
    }
  }
);

const prioritiesSlice = createSlice({
  name: 'priorities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStreamingResponse: (state, action) => {
      state.streamingResponse = action.payload;
    },
    resetStreaming: (state) => {
      state.streamingResponse = '';
    },
  },
  extraReducers: (builder) => {
    // generatePriorities
    builder
      .addCase(generatePriorities.pending, (state) => {
        state.generating = true;
        state.error = null;
        state.streamingResponse = '';
      })
      .addCase(generatePriorities.fulfilled, (state, action) => {
        state.generating = false;
        state.items = action.payload.priorities;
      })
      .addCase(generatePriorities.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      });

    // getPriorities
    builder
      .addCase(getPriorities.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPriorities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getPriorities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updatePriorities
    builder
      .addCase(updatePriorities.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePriorities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(updatePriorities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setStreamingResponse, resetStreaming } = prioritiesSlice.actions;
export default prioritiesSlice.reducer;

// Selectors
export const selectPriorities = (state: { priorities: PrioritiesState }) => state.priorities.items;
export const selectPrioritiesLoading = (state: { priorities: PrioritiesState }) => state.priorities.loading;
export const selectPrioritiesGenerating = (state: { priorities: PrioritiesState }) => state.priorities.generating;
export const selectPrioritiesError = (state: { priorities: PrioritiesState }) => state.priorities.error;
export const selectStreamingResponse = (state: { priorities: PrioritiesState }) => state.priorities.streamingResponse;
