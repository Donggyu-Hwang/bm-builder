export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };
