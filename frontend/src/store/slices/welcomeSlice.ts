import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface WelcomeState {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: WelcomeState = {
  isOpen: false,
  loading: false,
  error: null,
};

// Async thunks
export const checkWelcomeStatus = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>(
  'welcome/checkWelcomeStatus',
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to check welcome status');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to check welcome status');
      }

      // Show welcome if not shown yet
      const welcomeShown = data.data.user.welcome_shown;
      return welcomeShown === false;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to check welcome status';
      return rejectWithValue(message);
    }
  }
);

export const markWelcomeShown = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'welcome/markWelcomeShown',
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/v1/profile/welcome-shown`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark welcome as shown');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to mark welcome as shown');
      }

      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark welcome as shown';
      return rejectWithValue(message);
    }
  }
);

// Slice
const welcomeSlice = createSlice({
  name: 'welcome',
  initialState,
  reducers: {
    openWelcome: (state) => {
      state.isOpen = true;
    },
    closeWelcome: (state) => {
      state.isOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkWelcomeStatus
      .addCase(checkWelcomeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkWelcomeStatus.fulfilled, (state, action) => {
        state.isOpen = action.payload;
        state.loading = false;
      })
      .addCase(checkWelcomeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // markWelcomeShown
      .addCase(markWelcomeShown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markWelcomeShown.fulfilled, (state) => {
        state.isOpen = false;
        state.loading = false;
      })
      .addCase(markWelcomeShown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { openWelcome, closeWelcome, clearError } = welcomeSlice.actions;

// Selectors
export const selectWelcome = (state: { welcome: WelcomeState }) => state.welcome;
export const selectWelcomeIsOpen = (state: { welcome: WelcomeState }) => state.welcome.isOpen;
export const selectWelcomeLoading = (state: { welcome: WelcomeState }) => state.welcome.loading;
export const selectWelcomeError = (state: { welcome: WelcomeState }) => state.welcome.error;

export default welcomeSlice.reducer;
