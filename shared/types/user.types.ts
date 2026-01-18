export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  welcome_shown?: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
}
