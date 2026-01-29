export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
}

export interface CreateUserInput {
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  onboarding_completed?: boolean;
}
