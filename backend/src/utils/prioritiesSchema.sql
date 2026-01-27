-- Create daily_priorities table
CREATE TABLE IF NOT EXISTS daily_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual', -- 'ai_suggestion' or 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS daily_priorities_user_id_idx ON daily_priorities(user_id);
CREATE INDEX IF NOT EXISTS daily_priorities_created_at_idx ON daily_priorities(created_at);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_daily_priorities_updated_at ON daily_priorities;
CREATE TRIGGER update_daily_priorities_updated_at
  BEFORE UPDATE ON daily_priorities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
