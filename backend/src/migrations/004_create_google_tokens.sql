-- Migration 004: Create Google OAuth tokens table
-- Story 2.1: Google Drive OAuth 2.0 Integration

-- Add google_drive_connected column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS google_drive_connected BOOLEAN DEFAULT FALSE;

-- Create google_tokens table
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS google_tokens_user_id_idx ON google_tokens(user_id);
CREATE INDEX IF NOT EXISTS google_tokens_expires_at_idx ON google_tokens(token_expires_at);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_tokens;
CREATE TRIGGER update_google_tokens_updated_at BEFORE UPDATE ON google_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE google_tokens IS 'Stores OAuth 2.0 tokens for Google Drive integration';
COMMENT ON COLUMN google_tokens.access_token IS 'Encrypted OAuth access token';
COMMENT ON COLUMN google_tokens.refresh_token IS 'Encrypted OAuth refresh token';
COMMENT ON COLUMN google_tokens.token_expires_at IS 'Expiration timestamp for access token';
