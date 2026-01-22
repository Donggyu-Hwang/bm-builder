-- Migration 005: Create document generation tables
-- Story 3.1: Document Generation Flow UI

-- Document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gov_support', 'ir_material')),
  description TEXT,
  prompt_template TEXT NOT NULL,
  questions_min INTEGER DEFAULT 5,
  questions_max INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT template_type_format CHECK (template_type ~ '^[a-z_]+$')
);

-- Document generation sessions table
CREATE TABLE IF NOT EXISTS document_generation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL REFERENCES document_templates(template_type),
  status TEXT NOT NULL DEFAULT 'interview' CHECK (status IN ('interview', 'generating', 'completed', 'failed', 'abandoned')),
  answers_json JSONB DEFAULT '{}',
  current_question_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON document_generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON document_generation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON document_generation_sessions(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_generation_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_document_generation_sessions_updated_at_trigger ON document_generation_sessions;
CREATE TRIGGER update_document_generation_sessions_updated_at_trigger
  BEFORE UPDATE ON document_generation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_document_generation_sessions_updated_at();

-- Insert document templates
INSERT INTO document_templates (template_type, template_name, category, description, prompt_template, questions_min, questions_max) VALUES
('preliminary_startup', '예비창업', 'gov_support', '창업아이dea 공모전을 위한 문서', 'Generate 5-7 questions for preliminary startup application focusing on: problem definition, solution uniqueness, market potential, team capability, and business model viability.', 5, 7),
('early_startup', '초기창업', 'gov_support', '벤처투자 유치를 위한 문서', 'Generate 5-7 questions for early startup funding focusing on: market size, product differentiation, traction metrics, team composition, and funding requirements.', 5, 7),
('rnd', 'R&D', 'gov_support', '기업부설지원사업', 'Generate 6-8 questions for R&D funding focusing on: technical innovation, research methodology, development roadmap, team expertise, and commercialization potential.', 6, 8),
('growth', '성장', 'gov_support', '고성장기업 지원', 'Generate 5-6 questions for growth stage funding focusing on: revenue growth rate, market expansion strategy, organizational scaling, competitive advantages, and international market potential.', 5, 6),
('specialization', '특화', 'gov_support', '지역/플랫폼 특화', 'Generate 5-6 questions for specialized support focusing on: regional characteristics, platform strategy, local partnerships, specialized market penetration, and sustainable differentiation.', 5, 6),
('pitch_deck', '피칭 데크', 'ir_material', '투자자 피칭을 위한 10-15장 슬라이드', 'Generate 8-10 questions for pitch deck creation focusing on: mission/vision, problem statement, solution, market opportunity, product demo, business model, traction, competition, team, and financial projections.', 8, 10),
('one_pager', '1-Pager', 'ir_material', '한 페이지 요약', 'Generate 4-5 questions for one-pager creation focusing on: core value proposition, target market, key differentiators, and call-to-action.', 4, 5),
('business_model_canvas', '비즈니스 모델 캔버스', 'ir_material', '9블록 비즈니스 모델', 'Generate 9 questions covering all business model canvas blocks: key partners, key activities, key resources, value propositions, customer relationships, channels, customer segments, cost structure, and revenue streams.', 9, 9)
ON CONFLICT (template_type) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE document_templates IS 'Master table for document templates (government support and IR materials)';
COMMENT ON TABLE document_generation_sessions IS 'Tracks user interview sessions and answers for AI document generation';
COMMENT ON COLUMN document_generation_sessions.answers_json IS 'Stores question-answer pairs in JSONB format for efficient querying';
COMMENT ON COLUMN document_generation_sessions.current_question_number IS 'Tracks progress through interview questions';
