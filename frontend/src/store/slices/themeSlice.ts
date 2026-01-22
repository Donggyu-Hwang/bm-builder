import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Theme, UserPreferences } from '../../types/theme.types';
import {
  getUserPreferences as fetchUserPreferences,
  updateThemePreference as saveThemePreference,
} from '../../api/userPreferencesApi';

interface ThemeState {
  theme: Theme;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';

  const stored = localStorage.getItem('bm-builder-theme') as Theme;
  return stored || 'system';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  preferences: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserPreferences = createAsyncThunk(
  'theme/fetchUserPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const preferences = await fetchUserPreferences();
      return preferences;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user preferences');
    }
  }
);

export const updateUserThemePreference = createAsyncThunk(
  'theme/updateUserThemePreference',
  async (themePreference: Theme, { rejectWithValue }) => {
    try {
      const preferences = await saveThemePreference(themePreference);
      return preferences;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update theme preference');
    }
  }
);

// Slice
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('bm-builder-theme', action.payload);
      }
    },
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark';
      } else if (state.theme === 'dark') {
        state.theme = 'light';
      } else {
        // If system, determine current system theme and toggle
        const systemTheme =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        state.theme = systemTheme === 'dark' ? 'light' : 'dark';
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('bm-builder-theme', state.theme);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user preferences
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.theme = action.payload.themePreference;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update theme preference
      .addCase(updateUserThemePreference.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserThemePreference.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
        state.theme = action.payload.themePreference;
      })
      .addCase(updateUserThemePreference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTheme, toggleTheme, clearError } = themeSlice.actions;
export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;
export const selectUserPreferences = (state: { theme: ThemeState }) =>
  state.theme.preferences;
export const selectThemeLoading = (state: { theme: ThemeState }) =>
  state.theme.loading;
export const selectThemeError = (state: { theme: ThemeState }) =>
  state.theme.error;

export default themeSlice.reducer;
