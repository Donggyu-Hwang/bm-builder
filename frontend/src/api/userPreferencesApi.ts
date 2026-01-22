import axios from 'axios';
import type {
  UserPreferences,
  Theme,
} from '../types/theme.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Get current user's preferences
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  const response = await api.get('/api/v1/user-preferences');
  return response.data.data;
}

/**
 * Update user's theme preference
 */
export async function updateThemePreference(
  themePreference: Theme
): Promise<UserPreferences> {
  const response = await api.put('/api/v1/user-preferences/theme', {
    themePreference,
  });
  return response.data.data;
}

/**
 * Update user's show tooltips preference
 */
export async function updateShowTooltipsPreference(
  showTooltips: boolean
): Promise<UserPreferences> {
  const response = await api.put('/api/v1/user-preferences/tooltips', {
    showTooltips,
  });
  return response.data.data;
}
