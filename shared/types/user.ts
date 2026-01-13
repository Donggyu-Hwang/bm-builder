// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  show_tooltips?: boolean;
  node_ui_tour_completed?: boolean;
}

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}
