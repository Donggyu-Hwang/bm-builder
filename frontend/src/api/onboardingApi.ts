import type {
  OnboardingResponse,
  OnboardingInput,
  OnboardingApiResponse,
  OnboardingSaveResponse,
  OnboardingCompleteResponse,
  OnboardingResetResponse,
} from '../../../shared/types/onboarding.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const onboardingApi = {
  /**
   * Get current onboarding progress
   */
  async getOnboarding(): Promise<OnboardingApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/onboarding`, {
        credentials: 'include'
      });

      const result = await response.json() as { success: boolean; data?: { onboarding: OnboardingResponse | null }; error?: { code: string; message: string } };

      if (!response.ok || !result.success) {
        return { success: false, error: { code: result.error?.code || 'FETCH_ERROR', message: result.error?.message || 'Failed to fetch onboarding' } };
      }

      if (!result.data?.onboarding) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'No onboarding data found' } };
      }

      return { success: true, data: result.data.onboarding };
    } catch (error) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' } };
    }
  },

  /**
   * Save onboarding step (upsert)
   */
  async saveStep(
    step: 1 | 2 | 3,
    input: OnboardingInput
  ): Promise<OnboardingSaveResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/onboarding/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ step, ...input })
      });

      const result = await response.json() as { success: boolean; data?: { onboarding: OnboardingResponse }; error?: { code: string; message: string } };

      if (!response.ok || !result.success) {
        return { success: false, error: { code: result.error?.code || 'FETCH_ERROR', message: result.error?.message || 'Failed to save onboarding' } };
      }

      if (!result.data?.onboarding) {
        return { success: false, error: { code: 'SERVER_ERROR', message: 'Server returned no data' } };
      }

      return { success: true, data: result.data.onboarding };
    } catch (error) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' } };
    }
  },

  /**
   * Complete onboarding
   */
  async completeOnboarding(): Promise<OnboardingCompleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/onboarding/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const result = await response.json() as { success: boolean; data?: { message: string }; error?: { code: string; message: string } };

      if (!response.ok || !result.success) {
        return { success: false, error: { code: result.error?.code || 'FETCH_ERROR', message: result.error?.message || 'Failed to complete onboarding' } };
      }

      return { success: true, data: { message: result.data?.message || 'Onboarding completed successfully' } };
    } catch (error) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' } };
    }
  },

  /**
   * Reset onboarding (for "restart onboarding" feature)
   */
  async resetOnboarding(): Promise<OnboardingResetResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/onboarding/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const result = await response.json() as { success: boolean; data?: { message: string }; error?: { code: string; message: string } };

      if (!response.ok || !result.success) {
        return { success: false, error: { code: result.error?.code || 'FETCH_ERROR', message: result.error?.message || 'Failed to reset onboarding' } };
      }

      return { success: true, data: { message: result.data?.message || 'Onboarding reset successfully' } };
    } catch (error) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: error instanceof Error ? error.message : 'Network error' } };
    }
  },
};
