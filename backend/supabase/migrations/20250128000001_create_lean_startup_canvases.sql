-- Create lean_startup_canvases table
-- Epic 2-6: 린스타트업 캔버스를 위한 독립적인 테이블

CREATE TABLE IF NOT EXISTS lean_startup_canvases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- ReactFlow nodes 데이터
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- ReactFlow edges 데이터
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Progressive Disclosure 상태
  progressive_disclosure jsonb NOT NULL DEFAULT '{"unlocked_stages": [1, 2, 3], "show_all": false}'::jsonb,

  -- 진행률 추적 (계산을 위해 저장)
  stage_completion jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- 메타데이터
  title text DEFAULT '린스타트업 캔버스',
  description text,
  is_active boolean DEFAULT true,

  -- 타임스탬프
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lean_startup_canvases_user_id ON lean_startup_canvases(user_id);
CREATE INDEX IF NOT EXISTS idx_lean_startup_canvases_is_active ON lean_startup_canvases(is_active);
CREATE INDEX IF NOT EXISTS idx_lean_startup_canvases_updated_at ON lean_startup_canvases(updated_at DESC);

-- GIN 인덱스 for JSONB queries
CREATE INDEX IF NOT EXISTS idx_lean_startup_canvases_nodes ON lean_startup_canvases USING GIN (nodes);
CREATE INDEX IF NOT EXISTS idx_lean_startup_canvases_edges ON lean_startup_canvases USING GIN (edges);
CREATE INDEX IF NOT EXISTS idx_lean_startup_canvases_progressive_disclosure ON lean_startup_canvases USING GIN (progressive_disclosure);

-- 코멘트 추가
COMMENT ON TABLE lean_startup_canvases IS '린스타트업 7단계 캔버스 (Epic 2-6)';
COMMENT ON COLUMN lean_startup_canvases.nodes IS 'ReactFlow 노드 데이터 (7단계 린스타트업)';
COMMENT ON COLUMN lean_startup_canvases.edges IS 'ReactFlow 엣지 데이터 (노드 연결)';
COMMENT ON COLUMN lean_startup_canvases.progressive_disclosure IS 'Progressive Disclosure 상태 (잠금 해제 스테이지)';
COMMENT ON COLUMN lean_startup_canvases.stage_completion IS '각 스테이지 완료 상태';

-- Note: RLS (Row Level Security) policies are handled at the application level
-- via the requireAuth middleware in the API routes
-- For Supabase deployments, uncomment the RLS section below:

/*
-- RLS (Row Level Security) 활성화
ALTER TABLE lean_startup_canvases ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Supabase only - requires auth schema)
CREATE POLICY "Users can view their own canvases"
ON lean_startup_canvases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own canvases"
ON lean_startup_canvases FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvases"
ON lean_startup_canvases FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvases"
ON lean_startup_canvases FOR DELETE
USING (auth.uid() = user_id);
*/

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_lean_startup_canvases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lean_startup_canvases_updated_at
BEFORE UPDATE ON lean_startup_canvases
FOR EACH ROW
EXECUTE FUNCTION update_lean_startup_canvases_updated_at();
