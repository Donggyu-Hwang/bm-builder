import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, {
  startScan,
  fetchScanProgress,
  retryScan,
  clearError,
  setPolling,
  resetProgress,
  selectScanProgress,
  selectScanLoading,
  selectScanError,
  selectScanPolling
} from './fileScanSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mock API
vi.mock('../../api/fileScanApi', () => ({
  fileScanApi: {
    startScan: vi.fn(),
    getProgress: vi.fn(),
    retryScan: vi.fn()
  }
}));

describe('fileScanSlice', () => {
  const initialState = {
    progress: null,
    loading: false,
    error: null,
    polling: false
  };

  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        fileScan: reducer
      }
    });
  });

  describe('initial state', () => {
    it('should return initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('actions', () => {
    it('should clear error', () => {
      const state = {
        ...initialState,
        error: 'Test error'
      };

      const newState = reducer(state, clearError());

      expect(newState.error).toBeNull();
    });

    it('should set polling', () => {
      const newState = reducer(initialState, setPolling(true));

      expect(newState.polling).toBe(true);
    });

    it('should reset progress', () => {
      const state = {
        ...initialState,
        progress: {
          total: 100,
          scanned: 50,
          business: 10,
          status: 'scanning' as const
        },
        error: 'Test error'
      };

      const newState = reducer(state, resetProgress());

      expect(newState.progress).toBeNull();
      expect(newState.error).toBeNull();
    });
  });

  describe('startScan async thunk', () => {
    it('should handle pending state', () => {
      const state = reducer(initialState, { type: startScan.pending.type });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const state = reducer(
        { ...initialState, loading: true },
        { type: startScan.fulfilled.type, payload: { message: 'Scan started' } }
      );

      expect(state.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      const error = 'Failed to start scan';
      const state = reducer(
        { ...initialState, loading: true },
        { type: startScan.rejected.type, payload: error }
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('fetchScanProgress async thunk', () => {
    it('should handle pending state', () => {
      const state = reducer(initialState, { type: fetchScanProgress.pending.type });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const progressData = {
        total: 100,
        scanned: 50,
        business: 10,
        status: 'scanning' as const,
        estimatedTimeRemaining: '1분 0초'
      };

      const state = reducer(
        { ...initialState, loading: true },
        { type: fetchScanProgress.fulfilled.type, payload: progressData }
      );

      expect(state.loading).toBe(false);
      expect(state.progress).toEqual(progressData);
    });

    it('should handle rejected state', () => {
      const error = 'Failed to fetch progress';
      const state = reducer(
        { ...initialState, loading: true },
        { type: fetchScanProgress.rejected.type, payload: error }
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('retryScan async thunk', () => {
    it('should handle pending state', () => {
      const state = reducer(initialState, { type: retryScan.pending.type });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const state = reducer(
        { ...initialState, loading: true },
        { type: retryScan.fulfilled.type, payload: { message: 'Scan restarted' } }
      );

      expect(state.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      const error = 'Failed to retry scan';
      const state = reducer(
        { ...initialState, loading: true },
        { type: retryScan.rejected.type, payload: error }
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('selectors', () => {
    it('should select scan progress', () => {
      const progress = {
        total: 100,
        scanned: 50,
        business: 10,
        status: 'scanning' as const
      };

      const state = {
        ...initialState,
        progress
      };

      expect(selectScanProgress({ fileScan: state })).toEqual(progress);
    });

    it('should select scan loading', () => {
      const state = {
        ...initialState,
        loading: true
      };

      expect(selectScanLoading({ fileScan: state })).toBe(true);
    });

    it('should select scan error', () => {
      const error = 'Test error';
      const state = {
        ...initialState,
        error
      };

      expect(selectScanError({ fileScan: state })).toBe(error);
    });

    it('should select scan polling', () => {
      const state = {
        ...initialState,
        polling: true
      };

      expect(selectScanPolling({ fileScan: state })).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should handle complete scan lifecycle', () => {
      // Start scan
      let state = reducer(initialState, { type: startScan.pending.type });
      expect(state.loading).toBe(true);

      state = reducer(state, { type: startScan.fulfilled.type });
      expect(state.loading).toBe(false);

      // Fetch progress (scanning)
      const progressData = {
        total: 100,
        scanned: 50,
        business: 10,
        status: 'scanning' as const,
        estimatedTimeRemaining: '1분 0초'
      };

      state = reducer(state, { type: fetchScanProgress.pending.type });
      expect(state.loading).toBe(true);

      state = reducer(state, {
        type: fetchScanProgress.fulfilled.type,
        payload: progressData
      });
      expect(state.loading).toBe(false);
      expect(state.progress).toEqual(progressData);

      // Fetch progress (completed)
      const completedData = {
        total: 100,
        scanned: 100,
        business: 15,
        status: 'completed' as const
      };

      state = reducer(state, {
        type: fetchScanProgress.fulfilled.type,
        payload: completedData
      });
      expect(state.progress).toEqual(completedData);
    });

    it('should handle error and retry', () => {
      // Start scan
      let state = reducer(initialState, { type: startScan.pending.type });
      state = reducer(state, { type: startScan.fulfilled.type });

      // Scan fails
      const error = 'Network error';
      state = reducer(state, { type: fetchScanProgress.rejected.type, payload: error });
      expect(state.error).toBe(error);

      // Clear error
      state = reducer(state, clearError());
      expect(state.error).toBeNull();

      // Retry
      state = reducer(state, { type: retryScan.pending.type });
      expect(state.loading).toBe(true);

      state = reducer(state, { type: retryScan.fulfilled.type });
      expect(state.loading).toBe(false);
    });
  });
});
