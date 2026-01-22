-- Migration: Add theme_preference to user_preferences
-- Description: Add theme preference column for dark/light mode support

-- Add theme_preference column to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) NOT NULL DEFAULT 'light';

-- Add check constraint to ensure only valid values
ALTER TABLE public.user_preferences
ADD CONSTRAINT theme_preference_check
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Add comment
COMMENT ON COLUMN public.user_preferences.theme_preference IS 'User theme preference: light, dark, or system (default: light)';
