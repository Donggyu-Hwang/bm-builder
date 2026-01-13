import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getSession, signOut as signOutApi } from '../api/authApi';
import { signIn, signOut, setUser } from '../store/slices/authSlice';
import type { User } from '@shared/types/user';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);

  useEffect(() => {
    // Check session on mount
    dispatch(getSession() as any);

    // Set up auth state change listener
    const { data: { subscription } } = window.supabase?.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile
          const { data: profile } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          dispatch(setUser(profile as User));
        } else if (event === 'SIGNED_OUT') {
          dispatch(setUser(null));
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  const signInWithProvider = (provider: 'google' | 'naver') => {
    dispatch(signIn(provider));
  };

  const handleSignOut = async () => {
    await dispatch(signOut() as any);
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    signIn: signInWithProvider,
    signOut: handleSignOut,
  };
}
