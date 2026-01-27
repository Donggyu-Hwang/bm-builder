import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { googleDriveApi } from '../../api/googleDriveApi';

// State interface
export interface GoogleDriveState {
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
}

const initialState: GoogleDriveState = {
  isConnected: false,
  isConnecting: false,
  isDisconnecting: false,
  isReconnecting: false,
  error: null,
};

// Error type for rejectWithValue
interface ApiError {
  code: string;
  message: string;
}

// Async thunks with proper generic types
export const checkConnectionStatus = createAsyncThunk<
  { googleDriveConnected: boolean },
  void,
  { rejectValue: ApiError }
>('googleDrive/checkStatus', async (_, { rejectWithValue }) => {
  const result = await googleDriveApi.getStatus();

  if (!result.success) {
    return rejectWithValue(result.error);
  }

  return result.data;
});

export const connectGoogleDrive = createAsyncThunk<void, void, { rejectValue: ApiError }>(
  'googleDrive/connect',
  async (_, { rejectWithValue }) => {
    const result = await googleDriveApi.getAuthUrl();

    if (!result.success) {
      return rejectWithValue(result.error);
    }

    // Redirect to Google OAuth
    window.location.href = result.data.authUrl;

    // This won't execute due to redirect, but TypeScript needs a return
    return undefined;
  }
);

export const disconnectGoogleDrive = createAsyncThunk<
  { message: string; googleDriveConnected: boolean },
  void,
  { rejectValue: ApiError }
>('googleDrive/disconnect', async (_, { rejectWithValue }) => {
  const result = await googleDriveApi.disconnect();

  if (!result.success) {
    return rejectWithValue(result.error);
  }

  return result.data;
});

export const reconnectGoogleDrive = createAsyncThunk<
  { authUrl: string; state: string; message: string },
  void,
  { rejectValue: ApiError }
>('googleDrive/reconnect', async (_, { rejectWithValue }) => {
  const result = await googleDriveApi.reconnect();

  if (!result.success) {
    return rejectWithValue(result.error);
  }

  // Redirect to Google OAuth
  window.location.href = result.data.authUrl;

  // This won't execute due to redirect, but TypeScript needs a return
  return result.data;
});

// Slice
const googleDriveSlice = createSlice({
  name: 'googleDrive',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkConnectionStatus
      .addCase(checkConnectionStatus.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(checkConnectionStatus.fulfilled, (state, action) => {
        state.isConnected = action.payload.googleDriveConnected;
        state.isConnecting = false;
        state.error = null;
      })
      .addCase(checkConnectionStatus.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload?.message ?? '연결 상태 확인에 실패했습니다';
      })
      // connectGoogleDrive
      .addCase(connectGoogleDrive.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectGoogleDrive.fulfilled, (state) => {
        state.isConnecting = false;
        // Note: This won't execute due to redirect
      })
      .addCase(connectGoogleDrive.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload?.message ?? 'Google Drive 연결에 실패했습니다';
      })
      // disconnectGoogleDrive
      .addCase(disconnectGoogleDrive.pending, (state) => {
        state.isDisconnecting = true;
        state.error = null;
      })
      .addCase(disconnectGoogleDrive.fulfilled, (state) => {
        state.isConnected = false;
        state.isDisconnecting = false;
        state.error = null;
      })
      .addCase(disconnectGoogleDrive.rejected, (state, action) => {
        state.isDisconnecting = false;
        state.error = action.payload?.message ?? 'Google Drive 연동 해제에 실패했습니다';
      })
      // reconnectGoogleDrive
      .addCase(reconnectGoogleDrive.pending, (state) => {
        state.isReconnecting = true;
        state.error = null;
      })
      .addCase(reconnectGoogleDrive.fulfilled, (state) => {
        state.isReconnecting = false;
        // Note: This won't execute due to redirect
      })
      .addCase(reconnectGoogleDrive.rejected, (state, action) => {
        state.isReconnecting = false;
        state.error = action.payload?.message ?? 'Google Drive 재연동에 실패했습니다';
      });
  },
});

export const { clearError, setConnected } = googleDriveSlice.actions;

// Selectors
export const selectIsConnected = (state: { googleDrive: GoogleDriveState }) =>
  state.googleDrive.isConnected;
export const selectIsConnecting = (state: { googleDrive: GoogleDriveState }) =>
  state.googleDrive.isConnecting;
export const selectIsDisconnecting = (state: { googleDrive: GoogleDriveState }) =>
  state.googleDrive.isDisconnecting;
export const selectIsReconnecting = (state: { googleDrive: GoogleDriveState }) =>
  state.googleDrive.isReconnecting;
export const selectGoogleDriveError = (state: { googleDrive: GoogleDriveState }) =>
  state.googleDrive.error;

// Combined selector for backward compatibility (memoized)
export const selectGoogleDrive = createSelector(
  (state: { googleDrive: GoogleDriveState }) => state.googleDrive,
  (googleDrive) => ({
    googleDriveConnected: googleDrive.isConnected,
  })
);

export default googleDriveSlice.reducer;
