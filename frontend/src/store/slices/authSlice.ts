import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, Session, User } from '../../types/auth';
import * as authApi from '../../api/authApi';

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (provider: 'google' | 'naver', { rejectWithValue }) => {
    try {
      const response = await authApi.signInWithOAuth(provider);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  }
);

export const getSession = createAsyncThunk(
  'auth/getSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getSession();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '세션을 가져오는데 실패했습니다.');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.signOut();
      return;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '로그아웃에 실패했습니다.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // signIn
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getSession
    builder
      .addCase(getSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.session = action.payload.session;
          state.isAuthenticated = true;
        }
      })
      .addCase(getSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });

    // signOut
    builder
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
