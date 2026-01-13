import { supabaseAdmin } from '../utils/supabaseAdmin';

export async function getPreferences(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Return default preferences if not found
    return {
      show_tooltips: true,
      node_ui_tour_completed: false,
    };
  }

  return data;
}

export async function updatePreferences(
  userId: string,
  preferences: {
    show_tooltips?: boolean;
    node_ui_tour_completed?: boolean;
  }
) {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
