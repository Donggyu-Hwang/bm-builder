import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fileScanApi, ScanProgressResponse } from '../../api/fileScanApi';

/**
 * File Scan State
 */
interface FileScanState {
  progress: ScanProgressResponse | null;
  loading: boolean;
  error: string | null;
  polling: boolean;
  incrementalLoading: boolean;
}

const initialState: FileScanState = {
  progress: null,
  loading: false,
  error: null,
  polling: false,
  incrementalLoading: false
};

/**
 * Async Thunks
 */
export const startScan = createAsyncThunk(
  'fileScan/startScan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fileScanApi.startScan();
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '파일 스캔 시작에 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

export const startIncrementalScan = createAsyncThunk(
  'fileScan/startIncrementalScan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fileScanApi.startIncrementalScan();
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '증분 파일 스캔 시작에 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchScanProgress = createAsyncThunk(
  'fileScan/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const progress = await fileScanApi.getProgress();
      return progress;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '진행 상황 확인에 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

export const retryScan = createAsyncThunk(
  'fileScan/retryScan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fileScanApi.retryScan();
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '스캔 재시작에 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * File Scan Slice
 */
const fileScanSlice = createSlice({
  name: 'fileScan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.polling = action.payload;
    },
    resetProgress: (state) => {
      state.progress = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // startScan
    builder
      .addCase(startScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startScan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(startScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // startIncrementalScan
    builder
      .addCase(startIncrementalScan.pending, (state) => {
        state.incrementalLoading = true;
        state.error = null;
      })
      .addCase(startIncrementalScan.fulfilled, (state) => {
        state.incrementalLoading = false;
      })
      .addCase(startIncrementalScan.rejected, (state, action) => {
        state.incrementalLoading = false;
        state.error = action.payload as string;
      });

    // fetchScanProgress
    builder
      .addCase(fetchScanProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScanProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload;
      })
      .addCase(fetchScanProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // retryScan
    builder
      .addCase(retryScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryScan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(retryScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

/**
 * Actions
 */
export const { clearError, setPolling, resetProgress } = fileScanSlice.actions;

/**
 * Selectors
 */
export const selectScanProgress = (state: { fileScan: FileScanState }) =>
  state.fileScan.progress;
export const selectScanLoading = (state: { fileScan: FileScanState }) =>
  state.fileScan.loading;
export const selectIncrementalScanLoading = (state: { fileScan: FileScanState }) =>
  state.fileScan.incrementalLoading;
export const selectScanError = (state: { fileScan: FileScanState }) =>
  state.fileScan.error;
export const selectScanPolling = (state: { fileScan: FileScanState }) =>
  state.fileScan.polling;

/**
 * Reducer
 */
export default fileScanSlice.reducer;
