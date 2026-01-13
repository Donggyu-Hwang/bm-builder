import { supabase } from './supabase';
import type { AuthResponse } from '../types/auth';
import type { User } from '@shared/types/user';
import { DEMO_MODE_KEY } from '../utils/constants';

// Demo mode check
function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true' || new URLSearchParams(window.location.search).get('demo') === 'true';
}

export async function signInWithOAuth(provider: 'google' | 'naver'): Promise<AuthResponse> {
  if (isDemoMode()) {
    // Demo mode: return mock user
    const mockUser: User = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      full_name: 'Demo User',
      avatar_url: null,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };

    return {
      user: mockUser,
      session: {
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      },
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // OAuth redirect happens here
  window.location.href = data.url;
  return {} as AuthResponse;
}

export async function getSession(): Promise<AuthResponse | null> {
  if (isDemoMode()) {
    const mockUser: User = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      full_name: 'Demo User',
      avatar_url: null,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
    };

    return {
      user: mockUser,
      session: {
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      },
    };
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return {
    user: profile as User,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
      user: session.user,
    },
  };
}

export async function signOut(): Promise<void> {
  if (isDemoMode()) {
    localStorage.removeItem(DEMO_MODE_KEY);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function handleAuthCallback(): Promise<AuthResponse | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return {
    user: profile as User,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
      user: session.user,
    },
  };
}
