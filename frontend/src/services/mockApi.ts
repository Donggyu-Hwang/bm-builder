/**
 * Mock API Service for Demo Mode
 *
 * This service provides mock responses for API calls in demo mode,
 * allowing users to experience the application without actual API calls.
 */

export interface MockDocumentResponse {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface MockClaudeResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Mock document generation for demo mode
 * @param prompt - User's document generation prompt
 * @returns Mock document response after 2 second delay
 */
export const mockDocumentGeneration = async (prompt: string): Promise<MockDocumentResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    id: `demo-doc-${Date.now()}`,
    title: `${prompt} - 데모 문서`,
    content: `# ${prompt}

## 1. Executive Summary
이것은 데모 모드에서 생성된 문서입니다. 실제 가입 후 Claude AI를 통해 맞춤형 문서를 생성할 수 있습니다.

본 문서는 데모 목적으로 자동 생성되었으며, 사용자의 비즈니스 아이디어와 요구사항을 바탕으로 구조화되었습니다.

## 2. Business Model
### 2.1 Value Proposition
- 고객의 문제를 해결하는 핵심 가치 제안
- 차별화된 경쟁 우위
- 지속 가능한 수익 모델

### 2.2 Target Market
- 1차 타겟: [대상 고객 세그먼트]
- 2차 타겟: [확장 가능한 시장]
- 시장 규모: [TAM, SAM, SOM 분석]

## 3. Market Analysis
### 3.1 Industry Overview
- 현재 시장 동향
- 성장 기회와 도전 요소
- 경쟁 환경 분석

### 3.2 Competitive Advantage
- 기술적 우위성
- 비용 구조의 효율성
- 네트워크 효과

## 4. Financial Projections
### 4.1 Revenue Model
- 수익 흐름 구조
- 가격 전략
- 고객 획득 비용 vs 생애 가치

### 4.2 Growth Metrics
- 3개월, 6개월, 12개월 목표
- 주요 KPI 및 성과 지표
- 손익 분기점 분석

## 5. Team & Operations
- 핵심 팀 구조
- 운영 프로세스
- 기술적 요구사항

---

*⚠️ 데모 모드 안내: 이 문서는 저장되지 않습니다. 실제 문서를 생성하고 저장하려면 가입이 필요합니다.*
`,
    created_at: new Date().toISOString(),
  };
};

/**
 * Mock Claude API call for demo mode
 * @param messages - Array of chat messages
 * @returns Mock Claude response after 1.5 second delay
 */
export const mockClaudeApiCall = async (
  messages: Array<{ role: string; content: string }>
): Promise<MockClaudeResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lastMessage = messages[messages.length - 1]?.content || '';

  return {
    content: `[데모 모드] AI 응답: ${lastMessage}\n\n실제 가입 후 Claude AI의 고급 언어 모델을 활용하여 정교한 문서 생성, 분석, 및 개선 제안을 받을 수 있습니다.`,
    usage: {
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
    },
  };
};

/**
 * Mock file scan for demo mode
 * @returns Mock file scan results
 */
export const mockFileScan = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_files: 5,
    business_documents: 3,
    processed: 3,
    files: [
      {
        id: 'demo-file-1',
        name: '사업계획서_초안.pdf',
        type: 'business_plan',
        size: 1024000,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-file-2',
        name: '시장분석_보고서.docx',
        type: 'market_analysis',
        size: 512000,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-file-3',
        name: '재무제표_2024.xlsx',
        type: 'financials',
        size: 256000,
        created_at: new Date().toISOString(),
      },
    ],
  };
};

/**
 * Check if API call should be mocked
 * @param isDemoMode - Current demo mode state
 * @returns true if demo mode is active
 */
export const shouldMockApi = (isDemoMode: boolean): boolean => {
  return isDemoMode;
};
