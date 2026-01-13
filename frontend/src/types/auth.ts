import type { User, AuthUser } from '@shared/types/user';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

export interface SignInCredentials {
  provider: 'google' | 'naver';
}

export interface AuthResponse {
  user: User;
  session: Session;
}
