-- Migration: Create user_preferences table
-- Description: Table for storing user preferences like tooltip visibility

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  show_tooltips BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add comment
COMMENT ON TABLE public.user_preferences IS 'User preferences for UI customization';
COMMENT ON COLUMN public.user_preferences.user_id IS 'Reference to profiles table';
COMMENT ON COLUMN public.user_preferences.show_tooltips IS 'Whether to show business term tooltips (default: true)';
