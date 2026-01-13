// API Response Wrapper (Discriminated Union Pattern)
export type ApiResponse<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
