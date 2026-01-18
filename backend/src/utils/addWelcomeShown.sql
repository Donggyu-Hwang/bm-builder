-- Migration: Add welcome_shown flag to profiles table
-- Story: 1.4 - Personalized Welcome Message
-- Date: 2026-01-18

-- Add welcome_shown column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS welcome_shown BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_welcome_shown_idx ON public.profiles(welcome_shown);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.welcome_shown IS 'Tracks whether the user has seen the welcome message modal';
