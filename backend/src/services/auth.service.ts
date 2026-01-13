import { supabaseAdmin } from '../utils/supabaseAdmin';

export async function signInWithOAuth(provider: 'google' | 'naver') {
  // OAuth is handled by Supabase on the frontend
  // This endpoint can be used for any server-side OAuth setup if needed
  return {
    success: true,
    data: {
      message: 'OAuth handled by Supabase',
      provider,
    },
  };
}

export async function getSession(userId: string | undefined) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Profile not found');
  }

  return {
    success: true,
    data: profile,
  };
}

export async function signOut() {
  // Sign out is handled by Supabase on the frontend
  return {
    success: true,
    data: { message: 'Sign out handled by Supabase' },
  };
}
