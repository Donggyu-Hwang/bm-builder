import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Priority } from '../../api/prioritiesApi';
import { prioritiesApi } from '../../api/prioritiesApi';

interface PrioritiesState {
  items: Priority[];
  source: 'ai_suggestion' | 'manual';
  loading: boolean;
  generating: boolean;
  error: string | null;
  aiError?: string;
}

const initialState: PrioritiesState = {
  items: [],
  source: 'manual',
  loading: false,
  generating: false,
  error: null,
};

// Async thunks
export const loadPriorities = createAsyncThunk<
  { priorities: Priority[]; source: 'ai_suggestion' | 'manual' },
  void,
  { rejectValue: string }
>(
  'priorities/loadPriorities',
  async (_, { rejectWithValue }) => {
    const result = await prioritiesApi.get();

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return result.data;
  }
);

export const generatePriorities = createAsyncThunk<
  { priorities: Priority[]; source: 'ai_suggestion' | 'manual'; error?: string },
  { vision: string; target_customer: string; current_stage: 'idea' | 'prototype' | 'mvp' | 'growth' },
  { rejectValue: string }
>(
  'priorities/generatePriorities',
  async (input, { rejectWithValue }) => {
    const result = await prioritiesApi.generate(input);

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return result.data;
  }
);

export const updatePriorities = createAsyncThunk<
  { priorities: Priority[] },
  Priority[],
  { rejectValue: string }
>(
  'priorities/updatePriorities',
  async (priorities, { rejectWithValue }) => {
    const result = await prioritiesApi.update(priorities);

    if (!result.success) {
      return rejectWithValue(result.error.message);
    }

    return result.data;
  }
);

// Slice
const prioritiesSlice = createSlice({
  name: 'priorities',
  initialState,
  reducers: {
    reorderPriority: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const items = state.items.splice(fromIndex, 1);
      const movedItem = items[0];

      if (movedItem) {
        state.items.splice(toIndex, 0, movedItem);
        // Update order
        state.items.forEach((item, index) => {
          item.order = index;
        });
      }
    },
    addPriority: (state, action: PayloadAction<Omit<Priority, 'id' | 'order'>>) => {
      const newPriority: Priority = {
        id: `priority-${Date.now()}`,
        ...action.payload,
        order: state.items.length,
      };
      state.items.push(newPriority);
    },
    removePriority: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      // Reorder remaining items
      state.items.forEach((item, index) => {
        item.order = index;
      });
    },
    clearError: (state) => {
      state.error = null;
      state.aiError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadPriorities
      .addCase(loadPriorities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPriorities.fulfilled, (state, action) => {
        state.items = action.payload.priorities;
        state.source = action.payload.source;
        state.loading = false;
      })
      .addCase(loadPriorities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // generatePriorities
      .addCase(generatePriorities.pending, (state) => {
        state.generating = true;
        state.aiError = undefined;
        state.error = null;
      })
      .addCase(generatePriorities.fulfilled, (state, action) => {
        state.items = action.payload.priorities;
        state.source = action.payload.source;
        state.aiError = action.payload.error;
        state.generating = false;
      })
      .addCase(generatePriorities.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload ?? null;
      })

      // updatePriorities
      .addCase(updatePriorities.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePriorities.fulfilled, (state, action) => {
        state.items = action.payload.priorities;
        state.source = 'manual';
      })
      .addCase(updatePriorities.rejected, (state, action) => {
        state.error = action.payload ?? null;
      });
  },
});

export const { reorderPriority, addPriority, removePriority, clearError } = prioritiesSlice.actions;

// Selector
export const selectPriorities = (state: { priorities: PrioritiesState }) => state.priorities;

export default prioritiesSlice.reducer;
