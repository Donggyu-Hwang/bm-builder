# Story 3.6: AI 생성 실패 처리 및 재시도

**Story ID:** 3.6
**Epic:** Epic 3 - AI 문서 생성
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** AI 생성 실패 시 재시도할 수 있길 원해서,
**So that** 문서를 성공적으로 생성할 수 있다.

---

## Acceptance Criteria

### AC1: Claude API 실패 처리

**Given** 사용자가 문서 생성 중일 때
**When** Claude API 호출이 실패하면
**Then** 다음이 수행된다:
  - 3초 이내 GLM 4.7로 fallback (NFR-I2)
  - Fallback도 실패 시 사용자에게 에러 메시지 표시

### AC2: 에러 메시지

**And** 에러 메시지가 다음을 포함한다:
  - "문서 생성에 실패했습니다. 다시 시도하시겠습니까?"
  - 에러 원인 (선택 사항): "Claude API 일시 오류입니다."
  - "재시도" / "나중에" / "새로 만들기" 버튼

### AC3: 재시도

**When** 사용자가 "재시도"를 클릭하면
**Then** 이전 진행 상황이 유지된다:
  - 이미 생성된 부분이 있으면 표시 (프로그레시브 스트리밍 덕분)
  - 다시 Claude API 호출
  - 최대 3회 재시도

**And** 3회 실패 시:
  - "문서 생성에 지속적으로 실패하고 있습니다. 잠시 후 다시 시도해주세요." 메시지
  - "고객센터에 문의" 옵션

### AC4: 임시 저장

**When** 사용자가 "나중에"를 클릭하면
**Then** `documents` 테이블에 draft가 저장된다:
  - `status: "draft"`
  - `content` (부분적으로 생성된 내용)
  - "임시 저장되었습니다. 대시보드에서 다시 시작할 수 있습니다."

### AC5: 재시도 전략

**And** 장애 복구를 위해 retry 전략이 적용된다:
  - Exponential backoff: 1초 → 2초 → 4초
  - Jitter: random(0-1초) 추가
  - Circuit breaker: 5분 동안 10회 실패 시 해당 API 일시 중단

---

## Technical Implementation

### Retry Service

**File:** `backend/src/services/retry.service.ts`

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

export class RetryService {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    const { maxRetries, baseDelay, maxDelay, jitter } = config;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

        // Add jitter if enabled
        const finalDelay = jitter
          ? delay + Math.random() * 1000
          : delay;

        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${finalDelay}ms`);

        await this.sleep(finalDelay);
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const retryService = new RetryService();
```

### Circuit Breaker

**File:** `backend/src/services/circuitBreaker.service.ts`

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

export class CircuitBreakerService {
  private failures = new Map<string, number>();
  private lastFailureTime = new Map<string, number>();
  private state = new Map<string, 'closed' | 'open' | 'half-open'>();

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    config: CircuitBreakerConfig
  ): Promise<T> {
    const currentState = this.state.get(key) || 'closed';
    const lastFailure = this.lastFailureTime.get(key) || 0;
    const failures = this.failures.get(key) || 0;

    // Check if circuit should be reset
    if (currentState === 'open' && Date.now() - lastFailure > config.resetTimeout) {
      this.state.set(key, 'half-open');
      this.failures.set(key, 0);
    }

    // Reject if circuit is open
    if (this.state.get(key) === 'open') {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      
      // Reset on success
      if (this.state.get(key) === 'half-open') {
        this.state.set(key, 'closed');
      }
      this.failures.set(key, 0);

      return result;
    } catch (error) {
      const newFailures = failures + 1;
      this.failures.set(key, newFailures);
      this.lastFailureTime.set(key, Date.now());

      // Open circuit if threshold exceeded
      if (newFailures >= config.failureThreshold) {
        this.state.set(key, 'open');
        console.error(`Circuit breaker opened for ${key}`);
      }

      throw error;
    }
  }
}

export const circuitBreakerService = new CircuitBreakerService();
```

### Fallback Implementation

**File:** `backend/src/services/claudeWithFallback.service.ts`

```typescript
import { claudeService } from './claude.service';
import { retryService } from './retry.service';
import { circuitBreakerService } from './circuitBreaker.service';

export class ClaudeWithFallbackService {
  async generateWithFallback(params: {
    systemPrompt: string;
    userMessages: string[];
  }): Promise<AsyncIterable<string>> {
    try {
      // Try Claude API with retry
      return await retryService.retryWithBackoff(
        () => claudeService.generateDocument(params),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 4000,
          jitter: true
        }
      );
    } catch (claudeError) {
      console.error('Claude API failed, using fallback:', claudeError);

      // Fallback to GLM 4.7 (implementation depends on GLM API)
      // For now, throw error
      throw new Error('All AI providers failed. Please try again later.');
    }
  }
}

export const claudeWithFallbackService = new ClaudeWithFallbackService();
```

---

## Testing Checklist

- [ ] Claude API 실패 시 fallback이 작동함
- [ ] Exponential backoff가 올바르게 적용됨
- [ ] Circuit breaker가 10회 실패 후 열림
- [ ] 3회 재시도 후 최종 실패 메시지 표시
- [ ] "나중에" 클릭 시 draft로 저장됨
- [ ] Draft에서 다시 시작 가능

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Retry logic tested
- [ ] Circuit breaker tested
- [ ] Fallback mechanism implemented
- [ ] Draft save tested

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** High (retry logic, circuit breaker, fallback)
**Recommended Developer:** Dev agent
**Dependencies:** Story 3.2 (RAG-based Document Generation)
