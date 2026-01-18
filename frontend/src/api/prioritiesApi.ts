import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Priority {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface GeneratePrioritiesRequest {
  vision: string;
  target_customer: string;
  current_stage: 'idea' | 'prototype' | 'mvp' | 'growth';
}

export interface GeneratePrioritiesResponse {
  priorities: Priority[];
  source: 'ai_suggestion' | 'manual';
  error?: string;
}

export interface GetPrioritiesResponse {
  priorities: Priority[];
  source: 'ai_suggestion' | 'manual';
}

// Discriminated union for API responses
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export const prioritiesApi = {
  /**
   * Generate AI priorities
   */
  async generate(input: GeneratePrioritiesRequest): Promise<ApiResult<GeneratePrioritiesResponse>> {
    try {
      const response = await axios.post<{ success: boolean; data: GeneratePrioritiesResponse }>(
        `${API_BASE_URL}/api/v1/priorities/generate`,
        input,
        { withCredentials: true }
      );

      if (!response.data.success) {
        return {
          success: false,
          error: new Error('Failed to generate priorities'),
        };
      }

      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: new Error(error.response?.data?.error?.message || 'Failed to generate priorities'),
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  },

  /**
   * Get current priorities
   */
  async get(): Promise<ApiResult<GetPrioritiesResponse>> {
    try {
      const response = await axios.get<{ success: boolean; data: GetPrioritiesResponse }>(
        `${API_BASE_URL}/api/v1/priorities`,
        { withCredentials: true }
      );

      if (!response.data.success) {
        return {
          success: false,
          error: new Error('Failed to fetch priorities'),
        };
      }

      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: new Error(error.response?.data?.error?.message || 'Failed to fetch priorities'),
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  },

  /**
   * Update priorities
   */
  async update(priorities: Priority[]): Promise<ApiResult<{ priorities: Priority[] }>> {
    try {
      const response = await axios.put<{ success: boolean; data: { priorities: Priority[] } }>(
        `${API_BASE_URL}/api/v1/priorities`,
        { priorities },
        { withCredentials: true }
      );

      if (!response.data.success) {
        return {
          success: false,
          error: new Error('Failed to update priorities'),
        };
      }

      return { success: true, data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: new Error(error.response?.data?.error?.message || 'Failed to update priorities'),
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  },
};
