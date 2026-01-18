import { describe, it, expect, beforeEach, vi } from 'vitest';
import googleDriveReducer from './googleDriveSlice';
import { checkConnectionStatus, connectGoogleDrive, disconnectGoogleDrive } from './googleDriveSlice';
import type { GoogleDriveState } from './googleDriveSlice';
import { googleDriveApi } from '../../api/googleDriveApi';

// Mock the API
vi.mock('../../api/googleDriveApi', () => ({
  googleDriveApi: {
    getAuthUrl: vi.fn(),
    getStatus: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn()
  }
}));

describe('googleDriveSlice', () => {
  let initialState: GoogleDriveState;

  beforeEach(() => {
    initialState = {
      isConnected: false,
      isConnecting: false,
      isDisconnecting: false,
      isReconnecting: false,
      error: null
    };
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = googleDriveReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const stateWithError: GoogleDriveState = {
        ...initialState,
        error: 'Some error'
      };

      const newState = googleDriveReducer(stateWithError, { type: 'googleDrive/clearError' });

      expect(newState.error).toBeNull();
    });
  });

  describe('checkConnectionStatus', () => {
    it('should pending set loading', () => {
      const state = googleDriveReducer(initialState, {
        type: checkConnectionStatus.pending.type
      });

      expect(state).toEqual({
        ...initialState,
        isConnecting: true
      });
    });

    it('should fulfilled update connection status', () => {
      const mockResponse = {
        success: true,
        data: { googleDriveConnected: true }
      };

      vi.mocked(googleDriveApi.getStatus).mockResolvedValueOnce(mockResponse as any);

      const state = googleDriveReducer(initialState, {
        type: checkConnectionStatus.fulfilled.type,
        payload: mockResponse.data
      });

      expect(state.isConnected).toBe(true);
      expect(state.isConnecting).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should rejected set error', () => {
      const errorPayload = { code: 'ERROR', message: 'Test error' };

      const state = googleDriveReducer(initialState, {
        type: checkConnectionStatus.rejected.type,
        payload: errorPayload
      });

      expect(state.isConnecting).toBe(false);
      expect(state.error).toBe('Test error');
    });
  });

  describe('connectGoogleDrive', () => {
    it('should pending set connecting state', () => {
      const state = googleDriveReducer(initialState, {
        type: connectGoogleDrive.pending.type
      });

      expect(state.isConnecting).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should fulfilled clear connecting state', () => {
      const state = googleDriveReducer(initialState, {
        type: connectGoogleDrive.fulfilled.type
      });

      expect(state.isConnecting).toBe(false);
    });

    it('should rejected set error and clear connecting', () => {
      const errorPayload = { code: 'OAUTH_ERROR', message: 'OAuth failed' };

      const state = googleDriveReducer(initialState, {
        type: connectGoogleDrive.rejected.type,
        payload: errorPayload
      });

      expect(state.isConnecting).toBe(false);
      expect(state.error).toBe('OAuth failed');
    });
  });

  describe('disconnectGoogleDrive', () => {
    it('should pending set disconnecting state', () => {
      const state = googleDriveReducer(
        { ...initialState, isConnected: true },
        { type: disconnectGoogleDrive.pending.type }
      );

      expect(state.isDisconnecting).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should fulfilled update connection state', () => {
      const state = googleDriveReducer(
        { ...initialState, isConnected: true },
        { type: disconnectGoogleDrive.fulfilled.type }
      );

      expect(state.isConnected).toBe(false);
      expect(state.isDisconnecting).toBe(false);
    });

    it('should rejected set error', () => {
      const errorPayload = { code: 'DISCONNECT_ERROR', message: 'Disconnect failed' };

      const state = googleDriveReducer(
        { ...initialState, isConnected: true },
        {
          type: disconnectGoogleDrive.rejected.type,
          payload: errorPayload
        }
      );

      expect(state.isDisconnecting).toBe(false);
      expect(state.error).toBe('Disconnect failed');
    });
  });
});
