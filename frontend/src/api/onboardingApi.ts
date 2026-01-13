import { supabase } from './supabase';
import type { OnboardingResponse, OnboardingStep } from '../types/onboarding';

export async function saveResponse(
  step: OnboardingStep,
  response: string
): Promise<OnboardingResponse> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('onboarding_responses')
    .upsert({
      user_id: user.id,
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

  return data as OnboardingResponse;
}

export async function getResponses(): Promise<OnboardingResponse[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', user.id)
    .order('step_number', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as OnboardingResponse[]) || [];
}

export async function completeOnboarding(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}
