import { supabaseAdmin } from '../utils/supabaseAdmin';
import { claudeService } from './claude.service';
import type { PriorityItem } from '../../../frontend/src/types/priorities';

export async function generatePriorities(userId: string, onboardingResponses: string) {
  // Try Claude API first
  let priorities: PriorityItem[] = [];
  let lastError: Error | null = null;

  // Try Claude up to 3 times
  for (let i = 0; i < 3; i++) {
    try {
      priorities = await claudeService.generatePriorities(onboardingResponses);
      break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Claude attempt ${i + 1} failed:`, lastError.message);
    }
  }

  // If all Claude attempts failed, throw error
  if (priorities.length === 0 && lastError) {
    throw lastError;
  }

  // Save to database
  const { data, error } = await supabaseAdmin
    .from('daily_priorities')
    .insert({
      user_id: userId,
      priorities,
      source: 'ai_suggestion',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data.priorities as PriorityItem[]) || [];
}

export async function getPriorities(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('daily_priorities')
    .select('priorities')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return [];
  }

  return (data.priorities as PriorityItem[]) || [];
}

export async function updatePriorities(userId: string, priorities: PriorityItem[]) {
  const { data, error } = await supabaseAdmin
    .from('daily_priorities')
    .upsert({
      user_id: userId,
      priorities,
      source: 'manual',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data.priorities as PriorityItem[]) || [];
}
