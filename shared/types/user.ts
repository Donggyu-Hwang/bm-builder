export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  google_id?: string;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
}

export interface CreateUserInput {
  email: string;
  password_hash?: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  google_id?: string;
}

export interface UpdateUserInput {
  email?: string;
  password_hash?: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  google_id?: string;
  onboarding_completed?: boolean;
}
