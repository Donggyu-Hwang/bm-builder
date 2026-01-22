-- Update document_templates with 5 government support templates
-- This migration adds specific prompts for each government support document type

-- First, clear existing gov_support templates to avoid conflicts
DELETE FROM document_templates WHERE category = 'gov_support';

-- Insert 5 government support templates with detailed prompts
INSERT INTO document_templates (template_type, template_name, category, description, prompt_template, questions_min, questions_max) VALUES
-- 1. 예비창업
(
  'preliminary_startup',
  '예비창업',
  'gov_support',
  '창업아이디어 공모전을 위한 문서 (5-10페이지)',
  'Create a 5-10 page pre-startup application document including: 1) 창업아이디어 개요 (Startup Idea Overview), 2) 시장 분석 및 시장성 (Market Analysis), 3) 사업화 가능성 (Business Feasibility), 4) 경쟁우위 (Competitive Advantage), 5) 예상 기대효과 (Expected Outcomes). Focus on innovation, social impact, and market potential. Tone: Professional, persuasive. Language: Korean.',
  5,
  7
),

-- 2. 초기창업
(
  'early_startup',
  '초기창업',
  'gov_support',
  '벤처투자 유치를 위한 문서 (10-15페이지)',
  'Create a 10-15 page early-stage startup proposal including: 1) 투자 포트폴리오 개요 (Investment Overview), 2) 팀 소개 (Team Introduction), 3) 제품/서비스 상세 (Product Details), 4) 시장 분석 (Market Analysis), 5) 비즈니스 모델 (Business Model), 6) 성과 및 트랙션 (Achievements & Traction). Focus on product-market fit, team, and scalability. Tone: Professional, confident, data-driven. Language: Korean.',
  6,
  8
),

-- 3. R&D 프로젝트
(
  'rd_project',
  'R&D',
  'gov_support',
  '기업부설지원사업을 위한 문서 (20-30페이지)',
  'Create a 20-30 page R&D proposal including: 1) 과제 목표 및 배경 (Project Objectives), 2) 핵심 기술 및 혁신성 (Core Technology & Innovation), 3) 기술성 및 검증 방법 (Technical Feasibility), 4) 시장성 및 사업화 계획 (Commercialization Plan), 5) 추진 전략 및 일정 (Implementation Strategy), 6) 기대 성과 및 파급 효과 (Expected Outcomes). Focus on technical innovation, feasibility, and commercialization. Tone: Technical, precise, evidence-based. Language: Korean.',
  7,
  10
),

-- 4. 성장단계
(
  'growth_stage',
  '성장',
  'gov_support',
  '고성장기업 지원을 위한 문서 (10-15페이지)',
  'Create a 10-15 page growth strategy document including: 1) 현재 성과 현황 (Current Achievements), 2) 매출 성장 전략 (Revenue Growth Strategy), 3) 시장 확장 계획 (Market Expansion), 4) 조직 확장 및 인력 (Organizational Scaling), 5) 운영 최적화 (Operational Excellence), 6) 향후 3년 로드맵 (3-Year Roadmap). Focus on revenue growth, market expansion, and team scaling. Tone: Strategic, ambitious, actionable. Language: Korean.',
  6,
  8
),

-- 5. 특화지원
(
  'specialized_support',
  '특화',
  'gov_support',
  '지역/플랫폼 특화 지원을 위한 문서 (8-12페이지)',
  'Create a 8-12 page specialization strategy document including: 1) 지역 특성 및 강점 (Regional Characteristics), 2) 플랫폼 전략 (Platform Strategy), 3) 차별화 요소 (Differentiation Factors), 4) 틈새 시장 포지셔닝 (Niche Market Positioning), 5) 지역 생태계 활용 (Local Ecosystem), 6) 지속 가능성 (Sustainability). Focus on regional advantages, platform differentiation, and niche positioning. Tone: Specialized, strategic, locally-focused. Language: Korean.',
  5,
  7
);

-- Add comments for documentation
COMMENT ON TABLE document_templates IS 'Document templates for government support and IR materials';
COMMENT ON COLUMN document_templates.prompt_template IS 'Detailed prompt template for AI document generation';
COMMENT ON COLUMN document_templates.questions_min IS 'Minimum number of interview questions';
COMMENT ON COLUMN document_templates.questions_max IS 'Maximum number of interview questions';
