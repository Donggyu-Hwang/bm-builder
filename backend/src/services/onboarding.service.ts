import { supabaseAdmin } from '../utils/supabaseAdmin';
import type { OnboardingStep } from '../../../frontend/src/types/onboarding';

export async function saveResponse(
  userId: string,
  step: OnboardingStep,
  response: string
) {
  const { data, error } = await supabaseAdmin
    .from('onboarding_responses')
    .upsert({
      user_id: userId,
      step_number: step,
      response,
    }, {
      onConflict: 'user_id,step_number',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getResponses(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .order('step_number', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function completeOnboarding(userId: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
