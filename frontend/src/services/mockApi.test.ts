import { mockDocumentGeneration, mockClaudeApiCall, mockFileScan, shouldMockApi } from './mockApi';

describe('mockApi', () => {
  describe('mockDocumentGeneration', () => {
    it('should return mock document after delay', async () => {
      const startTime = Date.now();
      const result = await mockDocumentGeneration('사업계획서');
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(1900); // ~2 seconds
      expect(result.id).toMatch(/^demo-doc-\d+$/);
      expect(result.title).toContain('데모 문서');
      expect(result.content).toContain('데모 모드에서 생성된 문서');
      expect(result.created_at).toBeDefined();
    });

    it('should include proper document structure', async () => {
      const result = await mockDocumentGeneration('마케팅 계획');

      expect(result.content).toContain('Executive Summary');
      expect(result.content).toContain('Business Model');
      expect(result.content).toContain('Market Analysis');
      expect(result.content).toContain('Financial Projections');
      expect(result.content).toContain('Team & Operations');
    });
  });

  describe('mockClaudeApiCall', () => {
    it('should return mock Claude response after delay', async () => {
      const startTime = Date.now();
      const messages = [{ role: 'user', content: '안녕하세요' }];
      const result = await mockClaudeApiCall(messages);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(1400); // ~1.5 seconds
      expect(result.content).toContain('[데모 모드]');
      expect(result.usage.prompt_tokens).toBe(100);
      expect(result.usage.completion_tokens).toBe(200);
      expect(result.usage.total_tokens).toBe(300);
    });

    it('should include user message in response', async () => {
      const messages = [{ role: 'user', content: '비즈니스 모델 작성해주세요' }];
      const result = await mockClaudeApiCall(messages);

      expect(result.content).toContain('비즈니스 모델 작성해주세요');
    });
  });

  describe('mockFileScan', () => {
    it('should return mock file scan results after delay', async () => {
      const startTime = Date.now();
      const result = await mockFileScan();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(900); // ~1 second
      expect(result.total_files).toBe(5);
      expect(result.business_documents).toBe(3);
      expect(result.processed).toBe(3);
      expect(result.files).toHaveLength(3);
    });

    it('should include correct file types', async () => {
      const result = await mockFileScan();

      expect(result.files[0].type).toBe('business_plan');
      expect(result.files[1].type).toBe('market_analysis');
      expect(result.files[2].type).toBe('financials');
    });
  });

  describe('shouldMockApi', () => {
    it('should return true when demo mode is active', () => {
      expect(shouldMockApi(true)).toBe(true);
    });

    it('should return false when demo mode is inactive', () => {
      expect(shouldMockApi(false)).toBe(false);
    });
  });
});
