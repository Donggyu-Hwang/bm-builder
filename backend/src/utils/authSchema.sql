-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update profiles table (if not already done)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Indexes
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Auto-delete expired tokens function
CREATE OR REPLACE FUNCTION delete_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
