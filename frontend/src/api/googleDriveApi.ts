const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Types for Google Drive API responses
export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface CallbackResponse {
  message: string;
  googleDriveConnected: boolean;
  scanStarted: boolean;
}

export interface StatusResponse {
  googleDriveConnected: boolean;
}

export interface DisconnectResponse {
  message: string;
  googleDriveConnected: boolean;
}

export interface ReconnectResponse {
  authUrl: string;
  state: string;
  message: string;
}

// API Error interface
export interface ApiError {
  code: string;
  message: string;
}

// Discriminated union for API responses
export type GoogleDriveApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Validate API response structure with type guard
function isValidApiResponse(obj: unknown): obj is { success: boolean; data?: unknown; error?: unknown } {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const response = obj as Record<string, unknown>;

  if ('success' in response && typeof response.success === 'boolean') {
    if (response.success) {
      return 'data' in response;
    } else {
      return 'error' in response &&
             typeof response.error === 'object' &&
             response.error !== null &&
             'code' in response.error &&
             'message' in response.error;
    }
  }

  return false;
}

export const googleDriveApi = {
  /**
   * Get OAuth authorization URL
   */
  async getAuthUrl(): Promise<GoogleDriveApiResponse<AuthUrlResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/google-drive/auth-url`, {
        credentials: 'include'
      });

      const result = await response.json() as unknown;

      // Runtime validation
      if (!isValidApiResponse(result)) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'OAuth URL 생성에 실패했습니다'
          }
        };
      }

      if (!response.ok || !result.success) {
        return result as GoogleDriveApiResponse<AuthUrlResponse>;
      }

      return {
        success: true,
        data: result.data as AuthUrlResponse
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  },

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    code: string,
    state: string
  ): Promise<GoogleDriveApiResponse<CallbackResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/google-drive/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, state })
      });

      const result = await response.json() as unknown;

      // Runtime validation
      if (!isValidApiResponse(result)) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'OAuth 연동에 실패했습니다'
          }
        };
      }

      if (!response.ok || !result.success) {
        return result as GoogleDriveApiResponse<CallbackResponse>;
      }

      return {
        success: true,
        data: result.data as CallbackResponse
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  },

  /**
   * Check connection status
   */
  async getStatus(): Promise<GoogleDriveApiResponse<StatusResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/google-drive/status`, {
        credentials: 'include'
      });

      const result = await response.json() as unknown;

      // Runtime validation
      if (!isValidApiResponse(result)) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: '연동 상태 확인에 실패했습니다'
          }
        };
      }

      if (!response.ok || !result.success) {
        return result as GoogleDriveApiResponse<StatusResponse>;
      }

      return {
        success: true,
        data: result.data as StatusResponse
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  },

  /**
   * Disconnect Google Drive
   */
  async disconnect(): Promise<GoogleDriveApiResponse<DisconnectResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/google-drive/disconnect`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json() as unknown;

      // Runtime validation
      if (!isValidApiResponse(result)) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: '연동 해제에 실패했습니다'
          }
        };
      }

      if (!response.ok || !result.success) {
        return result as GoogleDriveApiResponse<DisconnectResponse>;
      }

      return {
        success: true,
        data: result.data as DisconnectResponse
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  },

  /**
   * Reconnect Google Drive
   */
  async reconnect(): Promise<GoogleDriveApiResponse<ReconnectResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/google-drive/reconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const result = await response.json() as unknown;

      // Runtime validation
      if (!isValidApiResponse(result)) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: '재연동 URL 생성에 실패했습니다'
          }
        };
      }

      if (!response.ok || !result.success) {
        return result as GoogleDriveApiResponse<ReconnectResponse>;
      }

      return {
        success: true,
        data: result.data as ReconnectResponse
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  }
};
