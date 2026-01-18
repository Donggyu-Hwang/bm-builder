-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step INTEGER NOT NULL DEFAULT 1,
  vision TEXT,
  target_customer TEXT,
  current_stage TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own onboarding"
ON onboarding_responses
FOR SELECT
USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own onboarding"
ON onboarding_responses
FOR INSERT
WITH CHECK (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own onboarding"
ON onboarding_responses
FOR UPDATE
USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own onboarding"
ON onboarding_responses
FOR DELETE
USING (user_id = (SELECT id FROM profiles WHERE id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS onboarding_responses_user_id_idx ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS onboarding_responses_step_idx ON onboarding_responses(step);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_onboarding_responses_updated_at ON onboarding_responses;
CREATE TRIGGER update_onboarding_responses_updated_at
  BEFORE UPDATE ON onboarding_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
