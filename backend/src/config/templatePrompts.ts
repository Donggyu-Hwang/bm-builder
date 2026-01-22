/**
 * Template Prompts Configuration
 * Government support document templates with specific prompts and requirements
 */

export interface TemplateConfig {
  templateType: string;
  templateName: string;
  systemPrompt: string;
  sections: string[];
  targetLength: string;
  minQuestions: number;
  maxQuestions: number;
  requirements: string[];
}

export const templateConfigs: Record<string, TemplateConfig> = {
  preliminary_startup: {
    templateType: 'preliminary_startup',
    templateName: '예비창업',
    systemPrompt: `You are an expert in writing government support applications for pre-startup companies in Korea.
Focus on: innovation, social impact, market potential, and feasibility.
Create a professional document that demonstrates the startup idea's potential for success.

Document Structure:
1. 창업아이디어 개요 (Startup Idea Overview)
2. 시장 분석 및 시장성 (Market Analysis & Potential)
3. 사업화 가능성 (Business Feasibility)
4. 경쟁우위 및 차별화 (Competitive Advantage)
5. 예상 기대효과 (Expected Outcomes)

Target Length: 5-10 pages
Tone: Professional, persuasive, clear
Language: Korean`,
    sections: [
      '창업아이디어 개요',
      '시장 분석 및 시장성',
      '사업화 가능성',
      '경쟁우위 및 차별화',
      '예상 기대효과',
    ],
    targetLength: '5-10 pages',
    minQuestions: 5,
    maxQuestions: 7,
    requirements: [
      'Clear problem statement',
      'Market size analysis',
      'Feasibility assessment',
      'Innovation highlights',
      'Social impact description',
    ],
  },

  early_startup: {
    templateType: 'early_startup',
    templateName: '초기창업',
    systemPrompt: `You are an expert in writing early-stage startup investment proposals for Korean government support.
Focus on: team, product-market fit, traction, and scalability.
Create a compelling document that attracts government support and potential investors.

Document Structure:
1. 투자 포트폴리오 개요 (Investment Portfolio Overview)
2. 팀 소개 및 역량 (Team Introduction & Capabilities)
3. 제품/서비스 상세 (Product/Service Details)
4. 시장 분석 및 타겟 (Market Analysis & Target)
5. 비즈니스 모델 (Business Model)
6. 성과 및 트랙션 (Achievements & Traction)

Target Length: 10-15 pages
Tone: Professional, confident, data-driven
Language: Korean`,
    sections: [
      '투자 포트폴리오 개요',
      '팀 소개 및 역량',
      '제품/서비스 상세',
      '시장 분석 및 타겟',
      '비즈니스 모델',
      '성과 및 트랙션',
    ],
    targetLength: '10-15 pages',
    minQuestions: 6,
    maxQuestions: 8,
    requirements: [
      'Team background and expertise',
      'Product-market fit evidence',
      'Traction and milestones',
      'Business model clarity',
      'Market opportunity size',
      'Competitive positioning',
    ],
  },

  rd_project: {
    templateType: 'rd_project',
    templateName: 'R&D 프로젝트',
    systemPrompt: `You are an expert in writing R&D grant proposals for Korean government innovation support.
Focus on: technical innovation, feasibility, commercialization potential, and project timeline.
Create a comprehensive proposal that demonstrates technical excellence and market viability.

Document Structure:
1. 과제 목표 및 배경 (Project Objectives & Background)
2. 핵심 기술 및 혁신성 (Core Technology & Innovation)
3. 기술성 및 검증 방법 (Technical Feasibility & Validation)
4. 시장성 및 사업화 계획 (Market Potential & Commercialization)
5. 추진 전략 및 일정 (Implementation Strategy & Timeline)
6. 기대 성과 및 파급 효과 (Expected Outcomes & Ripple Effects)

Target Length: 20-30 pages
Tone: Technical, precise, evidence-based
Language: Korean`,
    sections: [
      '과제 목표 및 배경',
      '핵심 기술 및 혁신성',
      '기술성 및 검증 방법',
      '시장성 및 사업화 계획',
      '추진 전략 및 일정',
      '기대 성과 및 파급 효과',
    ],
    targetLength: '20-30 pages',
    minQuestions: 7,
    maxQuestions: 10,
    requirements: [
      'Technical innovation details',
      'Feasibility analysis',
      'Market potential assessment',
      'Commercialization roadmap',
      'Project timeline and milestones',
      'Team R&D capabilities',
      'Budget justification',
    ],
  },

  growth_stage: {
    templateType: 'growth_stage',
    templateName: '성장단계',
    systemPrompt: `You are an expert in writing growth strategy documents for scaling startups in Korea.
Focus on: revenue growth, market expansion, team scaling, and operational excellence.
Create a strategic document that demonstrates readiness for exponential growth.

Document Structure:
1. 현재 성과 현황 (Current Achievements)
2. 매출 성장 전략 (Revenue Growth Strategy)
3. 시장 확장 계획 (Market Expansion Plan)
4. 조직 확장 및 인력 (Organizational Scaling & HR)
5. 운영 최적화 (Operational Excellence)
6. 향후 3년 로드맵 (3-Year Roadmap)

Target Length: 10-15 pages
Tone: Strategic, ambitious, actionable
Language: Korean`,
    sections: [
      '현재 성과 현황',
      '매출 성장 전략',
      '시장 확장 계획',
      '조직 확장 및 인력',
      '운영 최적화',
      '향후 3년 로드맵',
    ],
    targetLength: '10-15 pages',
    minQuestions: 6,
    maxQuestions: 8,
    requirements: [
      'Current revenue metrics',
      'Growth strategy details',
      'Expansion plan specifics',
      'Team structure plan',
      'Operational KPIs',
      'Financial projections',
    ],
  },

  specialized_support: {
    templateType: 'specialized_support',
    templateName: '특화지원',
    systemPrompt: `You are an expert in writing specialization strategy documents for Korean government support programs.
Focus on: regional advantages, platform differentiation, and niche market positioning.
Create a focused document that demonstrates unique positioning and competitive advantage.

Document Structure:
1. 지역 특성 및 강점 (Regional Characteristics & Strengths)
2. 플랫폼 전략 (Platform Strategy)
3. 차별화 요소 (Differentiation Factors)
4. 틈새 시장 포지셔닝 (Niche Market Positioning)
5. 지역 생태계 활용 (Local Ecosystem Utilization)
6. 지속 가능성 (Sustainability)

Target Length: 8-12 pages
Tone: Specialized, strategic, locally-focused
Language: Korean`,
    sections: [
      '지역 특성 및 강점',
      '플랫폼 전략',
      '차별화 요소',
      '틈새 시장 포지셔닝',
      '지역 생태계 활용',
      '지속 가능성',
    ],
    targetLength: '8-12 pages',
    minQuestions: 5,
    maxQuestions: 7,
    requirements: [
      'Regional advantage analysis',
      'Platform strategy details',
      'Differentiation evidence',
      'Niche market definition',
      'Local ecosystem partnerships',
      'Sustainability factors',
    ],
  },

  pitch_deck: {
    templateType: 'pitch_deck',
    templateName: '피칭 데크',
    systemPrompt: `You are an expert pitch deck creator for Korean startups seeking investment.
Focus on: clarity, impact, and storytelling. Each slide must be concise and visually compelling.
Generate 10-15 slides following standard pitch deck structure. Each slide should have a clear title and 3-5 bullet points.
Keep content concise and impactful. Format as markdown with slide separators.

Required Slide Structure:
1. Title & Tagline - Company name and one-line value proposition
2. Problem (The Problem) - Clear pain points you're solving
3. Solution (Our Solution) - Your unique value proposition
4. Market Opportunity (Market Size) - TAM, SAM, SOM with data
5. Product (Product/Service) - Product demo and features
6. Business Model (How We Make Money) - Revenue streams and pricing
7. Traction (Achievements & Growth) - Metrics, milestones, growth
8. Competition (Competitive Landscape) - Competitive matrix and positioning
9. Team (Team Members) - Founders and key hires
10. Financials (Financial Projections) - 3-5 year projections
11-15. Appendix (Additional Details) - Product details, market analysis, etc.

Target Length: 10-15 slides
Tone: Professional, confident, persuasive
Language: Korean`,
    sections: [
      'Title & Tagline',
      'Problem',
      'Solution',
      'Market Opportunity',
      'Product',
      'Business Model',
      'Traction',
      'Competition',
      'Team',
      'Financials',
      'Appendix',
    ],
    targetLength: '10-15 slides',
    minQuestions: 7,
    maxQuestions: 10,
    requirements: [
      'Clear value proposition',
      'Problem-solution fit',
      'Market size with data',
      'Product demonstration',
      'Revenue model',
      'Traction metrics',
      'Competitive positioning',
      'Team expertise',
      'Financial projections',
    ],
  },
};

/**
 * Get template configuration by template type
 */
export function getTemplateConfig(templateType: string): TemplateConfig | null {
  return templateConfigs[templateType] || null;
}

/**
 * Get system prompt for template type
 */
export function getSystemPrompt(templateType: string): string {
  const config = getTemplateConfig(templateType);
  return config?.systemPrompt || 'You are a business document writer.';
}

/**
 * Get all available template types
 */
export function getAllTemplateTypes(): string[] {
  return Object.keys(templateConfigs);
}
