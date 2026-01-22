# Story 3.4: 정부지원사업 5개 양식 지원

**Story ID:** 3.4
**Epic:** Epic 3 - AI 문서 생성
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 5개 정부지원사업 양식 중 하나를 선택하여 생성하려고,
**So that** 각 양식에 맞는 문서를 얻을 수 있다.

---

## Acceptance Criteria

### AC1: 양식별 템플릿 적용

**Given** 사용자가 문서 생성 페이지에서 양식을 선택할 때
**When** dropdown에서 다음 중 하나를 선택하면
**Then** 해당 양식에 맞는 템플릿이 적용된다:
  - 예비창업 (창업아이디어 공모)
  - 초기창업 (벤처투자 유치)
  - R&D (기업부설지원사업)
  - 성장 (고성장기업 지원)
  - 특화 (지역특화, 플랫폼 특화)

### AC2: 템플릿 로드

**And** 각 양식이 다른 템플릿을 사용한다:
  - `document_templates` 테이블에서 template_type별 `prompt_template` 로드
  - System prompt가 양식별 요구사항을 포함

### AC3: 양식별 섹션

**And** 양식별로 다른 섹션이 생성된다:
  - 예비창업: 창업아이디어, 시장성, 사업화 가능성
  - 초기창업: 투자 포트폴리, 팀, 제품, 시장, 비즈니스 모델
  - R&D: 과제 목표, 혁신성, 기술성, 사업화, 추진 전략
  - 성장: 매출 성장, 시장 확장, 조직 확장
  - 특화: 지역 특성, 플랫폼 전략

### AC4: 양식별 질문

**When** 사용자가 양식을 선택하면
**Then** AI 인터뷰가 해당 양식에 맞는 질문을 생성한다:
  - 예비창업: "어떤 사회문제를 해결하나요?"
  - 초기창업: "타겟 시장 규모는 얼마인가요?"
  - R&D: "핵심 기술의 혁신성은 무엇인가요?"

### AC5: 문서 요구사항

**And** 생성된 문서가 양식별 요구사항을 충족한다:
  - 페이지 수 (예비창업: 5-10페이지, R&D: 20-30페이지)
  - 필수 섹션 포함
  - 포맷팅 (글꼴, 줄 간격, 헤더 스타일)

---

## Technical Implementation

### Database Schema

```sql
-- Update document_templates with specific prompts
INSERT INTO document_templates (template_type, template_name, category, prompt_template) VALUES
('pre_startup', '예비창업', 'gov_support', 
'Create a 5-10 page document including:创业idea description, market analysis, business feasibility.'::text),

('early_startup', '초기창업', 'gov_support',
'Create a comprehensive document including: investment portfolio, team, product, market, business model.'::text),

('rnd', 'R&D', 'gov_support',
'Create a 20-30 page R&D proposal including: project objectives, innovation, technical feasibility, commercialization, strategy.'::text),

('growth', '성장', 'gov_support',
'Create a growth strategy document including: revenue growth, market expansion, organizational scaling.'::text),

('specialization', '특화', 'gov_support',
'Create a specialization strategy document including: regional characteristics, platform strategy.'::text);
```

### System Prompts

**File:** `backend/src/config/templatePrompts.ts`

```typescript
export const templatePrompts = {
  pre_startup: {
    systemPrompt: `You are an expert in writing government support applications for pre-startup companies.
Focus on: innovation, social impact, market potential, and feasibility.`,
    sections: ['창업아이디어', '시장성', '사업화 가능성', '예상 효과'],
    targetLength: '5-10 pages'
  },
  
  early_startup: {
    systemPrompt: `You are an expert in writing early-stage startup investment proposals.
Focus on: team, product-market fit, traction, and scalability.`,
    sections: ['투자 포트폴리오', '팀 소개', '제품/서비스', '시장 분석', '비즈니스 모델'],
    targetLength: '10-15 pages'
  },
  
  rnd: {
    systemPrompt: `You are an expert in writing R&D grant proposals.
Focus on: technical innovation, feasibility, commercialization potential, and project timeline.`,
    sections: ['과제 목표', '혁신성', '기술성', '사업화 계획', '추진 전략', '기대 효과'],
    targetLength: '20-30 pages'
  },
  
  growth: {
    systemPrompt: `You are an expert in writing growth strategy documents.
Focus on: revenue growth, market expansion, team scaling, and operational excellence.`,
    sections: ['매출 성장 전략', '시장 확장', '조직 확장', '운영 최적화'],
    targetLength: '10-15 pages'
  },
  
  specialization: {
    systemPrompt: `You are an expert in writing specialization strategy documents.
Focus on: regional advantages, platform differentiation, and niche market positioning.`,
    sections: ['지역 특성', '플랫폼 전략', '차별화 요소', '시장 포지셔닝'],
    targetLength: '8-12 pages'
  }
};
```

---

## Testing Checklist

- [ ] 5개 양식이 모두 dropdown에 표시됨
- [ ] 각 양식 선택 시 올바른 템플릿이 적용됨
- [ ] 양식별 섹션이 올바르게 생성됨
- [ ] 페이지 수 요구사항이 충족됨
- [ ] 필수 섹션이 모두 포함됨

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] All 5 templates configured and tested
- [ ] Template-specific questions validated
- [ ] Generated documents meet format requirements

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium (template configuration, prompt engineering)
**Recommended Developer:** Dev agent
**Dependencies:** Story 3.1 (Document Generation UI), Story 3.2 (RAG-based Generation)
