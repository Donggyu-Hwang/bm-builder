/**
 * Claude with Fallback Service
 * Handles Claude API calls with automatic retry, circuit breaker, and fallback
 */

import { claudeService } from './claude.service';
import { retryService, RetryConfig } from './retry.service';
import { circuitBreakerService, CircuitBreakerConfig } from './circuitBreaker.service';

export interface GenerateWithRetryParams {
  systemPrompt: string;
  userMessages: string[];
  maxTokens?: number;
  documentId?: string;
}

export interface GenerationResult {
  content: string;
  provider: 'claude' | 'glm' | 'fallback';
  attempts: number;
}

export class ClaudeWithFallbackService {
  private readonly CLAUDE_CIRCUIT_KEY = 'claude-api';

  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 4000, // 4 seconds
    jitter: true,
    onRetry: (attempt, error) => {
      console.log(`Claude API retry attempt ${attempt}: ${error.message}`);
    },
  };

  private readonly circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 10, // Open circuit after 10 failures
    resetTimeout: 5 * 60 * 1000, // 5 minutes
    halfOpenMaxCalls: 3, // Allow 3 trial calls in half-open state
  };

  /**
   * Generate document with retry and circuit breaker
   */
  async generateWithRetry(
    params: GenerateWithRetryParams
  ): Promise<GenerationResult> {
    let attemptCount = 0;

    try {
      // Try Claude API with retry and circuit breaker
      const content = await retryService.retryWithBackoff(
        () =>
          circuitBreakerService.execute(
            this.CLAUDE_CIRCUIT_KEY,
            () => claudeService.generateDocument(params),
            this.circuitBreakerConfig
          ),
        {
          ...this.retryConfig,
          onRetry: (attempt, error) => {
            attemptCount = attempt;
            if (this.retryConfig.onRetry) {
              this.retryConfig.onRetry(attempt, error);
            }
          },
        }
      );

      return {
        content,
        provider: 'claude',
        attempts: attemptCount + 1,
      };
    } catch (claudeError) {
      console.error('Claude API failed after all retries:', claudeError);

      // Check if circuit breaker is open
      const circuitState = circuitBreakerService.getState(this.CLAUDE_CIRCUIT_KEY);
      if (circuitState === 'open') {
        console.warn('Claude API circuit breaker is open, using fallback');
      }

      // TODO: Implement GLM 4.7 fallback here
      // For now, throw error with detailed information
      throw new Error(
        `AI 생성에 실패했습니다. ${circuitState === 'open' ? 'AI 서비스가 일시적으로 중단되었습니다. 잠시 후 다시 시도해주세요.' : '네트워크 연결을 확인하고 다시 시도해주세요.'}`
      );
    }
  }

  /**
   * Generate questions with retry
   */
  async generateQuestionsWithRetry(
    templateType: string
  ): Promise<string[]> {
    try {
      return await retryService.retryWithBackoff(
        () =>
          circuitBreakerService.execute(
            `${this.CLAUDE_CIRCUIT_KEY}-questions`,
            () => claudeService.generateQuestions(templateType),
            this.circuitBreakerConfig
          ),
        this.retryConfig
      );
    } catch (error) {
      console.error('Failed to generate questions after all retries:', error);

      // Return fallback questions based on template type
      return this.getFallbackQuestions(templateType);
    }
  }

  /**
   * Get fallback questions for template type
   */
  private getFallbackQuestions(templateType: string): string[] {
    const fallbackQuestions: Record<string, string[]> = {
      preliminary_startup: [
        '창업하려는 아이디어는 무엇인가요?',
        '이 아이디어를 생각하게 된 계기는 무엇인가요?',
        '타겟 고객은 누구인가요?',
        '해결하려는 문제점은 무엇인가요?',
        '경쟁사와의 차별점은 무엇인가요?',
      ],
      early_startup: [
        '현재 개발된 제품/서비스는 무엇인가요?',
        '팀 구성원은 누구인가요?',
        '현재까지의 성과는 무엇인가요?',
        '타겟 시장은 어떻게 되나요?',
        '비즈니스 모델은 무엇인가요?',
        '투자를 어떻게 사용할 계획인가요?',
      ],
      rd_project: [
        'R&D 과제의 목표는 무엇인가요?',
        '핵심 기술은 무엇인가요?',
        '기술적 혁신성은 무엇인가요?',
        '시장성은 어떻게 평가하나요?',
        '상업화 계획은 무엇인가요?',
        '추진 일정은 어떻게 되나요?',
        '기대 성과는 무엇인가요?',
      ],
      growth_stage: [
        '현재 매출 규모는 어느 정도인가요?',
        '성장 전략은 무엇인가요?',
        '시장 확장 계획은 있나요?',
        '팀 확장 계획은 무엇인가요?',
        '운영 최적화 방안은 무엇인가요?',
        '향후 3년 로드맵은 어떻게 되나요?',
      ],
      specialized_support: [
        '지역 특성과 강점은 무엇인가요?',
        '플랫폼 전략은 무엇인가요?',
        '차별화 요소는 무엇인가요?',
        '틈새 시장은 어디인가요?',
        '지역 생태계와 협력 계획은 있나요?',
        '지속 가능성은 어떻게 확보하나요?',
      ],
      pitch_deck: [
        '회사명과 한 줄 소개는 무엇인가요?',
        '해결하려는 문제는 무엇인가요?',
        '해결책은 무엇인가요?',
        '시장 규모는 어느 정도인가요?',
        '제품/서비스의 핵심 기능은 무엇인가요?',
        '비즈니스 모델은 무엇인가요?',
        '현재 성과는 무엇인가요?',
        '경쟁사와 차별점은 무엇인가요?',
        '팀 구성은 어떻게 되나요?',
        '재무 전망은 어떻게 되나요?',
      ],
    };

    return (
      fallbackQuestions[templateType] || [
        '프로젝트에 대해 설명해주세요.',
        '타겟 고객은 누구인가요?',
        '경쟁사와의 차별점은 무엇인가요?',
        '비즈니스 모델은 무엇인가요?',
        '향후 계획은 무엇인가요?',
      ]
    );
  }

  /**
   * Get circuit breaker state (for monitoring)
   */
  getCircuitBreakerState(): Record<string, string> {
    return circuitBreakerService.getAllStates();
  }

  /**
   * Reset circuit breaker (admin function)
   */
  resetCircuitBreaker(): void {
    circuitBreakerService.reset(this.CLAUDE_CIRCUIT_KEY);
  }
}

// Export singleton instance
export const claudeWithFallbackService = new ClaudeWithFallbackService();
