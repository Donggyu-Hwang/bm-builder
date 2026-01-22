import pool from '../utils/db';

export type ThemePreference = 'light' | 'dark' | 'system';

interface UserPreferences {
  userId: string;
  showTooltips: boolean;
  themePreference: ThemePreference;
  updatedAt: Date;
}

/**
 * Get user preferences by user ID
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const result = await pool.query(
    `SELECT user_id as "userId", show_tooltips as "showTooltips",
            theme_preference as "themePreference", updated_at as "updatedAt"
     FROM public.user_preferences
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Create default preferences for user
    return await createUserPreferences(userId);
  }

  return result.rows[0];
}

/**
 * Create default user preferences
 */
export async function createUserPreferences(userId: string): Promise<UserPreferences> {
  const result = await pool.query(
    `INSERT INTO public.user_preferences (user_id, show_tooltips, theme_preference)
     VALUES ($1, TRUE, 'light')
     RETURNING user_id as "userId", show_tooltips as "showTooltips",
               theme_preference as "themePreference", updated_at as "updatedAt"`,
    [userId]
  );

  return result.rows[0];
}

/**
 * Update theme preference
 */
export async function updateThemePreference(
  userId: string,
  themePreference: ThemePreference
): Promise<UserPreferences> {
  const result = await pool.query(
    `UPDATE public.user_preferences
     SET theme_preference = $1
     WHERE user_id = $2
     RETURNING user_id as "userId", show_tooltips as "showTooltips",
               theme_preference as "themePreference", updated_at as "updatedAt"`,
    [themePreference, userId]
  );

  if (result.rows.length === 0) {
    // Create with specified theme preference
    return await createUserPreferencesWithTheme(userId, themePreference);
  }

  return result.rows[0];
}

/**
 * Create user preferences with specific theme
 */
async function createUserPreferencesWithTheme(
  userId: string,
  themePreference: ThemePreference
): Promise<UserPreferences> {
  const result = await pool.query(
    `INSERT INTO public.user_preferences (user_id, show_tooltips, theme_preference)
     VALUES ($1, TRUE, $2)
     RETURNING user_id as "userId", show_tooltips as "showTooltips",
               theme_preference as "themePreference", updated_at as "updatedAt"`,
    [userId, themePreference]
  );

  return result.rows[0];
}

/**
 * Update show tooltips preference
 */
export async function updateShowTooltipsPreference(
  userId: string,
  showTooltips: boolean
): Promise<UserPreferences> {
  const result = await pool.query(
    `UPDATE public.user_preferences
     SET show_tooltips = $1
     WHERE user_id = $2
     RETURNING user_id as "userId", show_tooltips as "showTooltips",
               theme_preference as "themePreference", updated_at as "updatedAt"`,
    [showTooltips, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User preferences not found');
  }

  return result.rows[0];
}
