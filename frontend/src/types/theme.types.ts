export type Theme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  userId: string;
  showTooltips: boolean;
  themePreference: Theme;
  updatedAt: string;
}

export interface ThemePreferenceUpdate {
  themePreference: Theme;
}

export interface ShowTooltipsPreferenceUpdate {
  showTooltips: boolean;
}
