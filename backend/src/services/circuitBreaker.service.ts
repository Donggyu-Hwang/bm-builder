/**
 * Circuit Breaker Service
 * Implements circuit breaker pattern to prevent cascading failures
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: CircuitState;
  halfOpenCalls: number;
}

export class CircuitBreakerService {
  private breakers = new Map<string, CircuitBreakerState>();

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    config: CircuitBreakerConfig
  ): Promise<T> {
    const breaker = this.getOrCreateBreaker(key);
    const { failureThreshold, resetTimeout, halfOpenMaxCalls } = config;

    // Check if circuit should be reset
    if (
      breaker.state === 'open' &&
      Date.now() - breaker.lastFailureTime > resetTimeout
    ) {
      console.log(`Circuit breaker transitioning to half-open for ${key}`);
      breaker.state = 'half-open';
      breaker.failures = 0;
      breaker.halfOpenCalls = 0;
    }

    // Reject if circuit is open
    if (breaker.state === 'open') {
      const timeUntilReset =
        resetTimeout - (Date.now() - breaker.lastFailureTime);
      throw new Error(
        `Circuit breaker is open for ${key}. Reset in ${Math.ceil(
          timeUntilReset / 1000
        )}s`
      );
    }

    // Check half-open call limit
    if (breaker.state === 'half-open' && breaker.halfOpenCalls >= halfOpenMaxCalls) {
      throw new Error(
        `Circuit breaker is half-open for ${key}. Max trial calls reached.`
      );
    }

    try {
      const result = await operation();

      // Reset on success
      if (breaker.state === 'half-open') {
        console.log(`Circuit breaker closed for ${key} after successful trial`);
        breaker.state = 'closed';
        breaker.halfOpenCalls = 0;
      }
      breaker.failures = 0;

      return result;
    } catch (error) {
      breaker.failures += 1;
      breaker.lastFailureTime = Date.now();

      // Open circuit if threshold exceeded
      if (breaker.failures >= failureThreshold) {
        const prevState = breaker.state;
        breaker.state = 'open';
        console.error(
          `Circuit breaker opened for ${key} after ${breaker.failures} failures (prev state: ${prevState})`
        );
      } else {
        console.warn(
          `Circuit breaker failure ${breaker.failures}/${failureThreshold} for ${key}`
        );
      }

      throw error;
    } finally {
      if (breaker.state === 'half-open') {
        breaker.halfOpenCalls++;
      }
    }
  }

  /**
   * Get or create circuit breaker state for key
   */
  private getOrCreateBreaker(key: string): CircuitBreakerState {
    if (!this.breakers.has(key)) {
      this.breakers.set(key, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
        halfOpenCalls: 0,
      });
    }
    return this.breakers.get(key)!;
  }

  /**
   * Get current state of circuit breaker
   */
  getState(key: string): CircuitState | null {
    return this.breakers.get(key)?.state || null;
  }

  /**
   * Reset circuit breaker for key
   */
  reset(key: string): void {
    this.breakers.delete(key);
    console.log(`Circuit breaker reset for ${key}`);
  }

  /**
   * Get all circuit breaker states
   */
  getAllStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};
    this.breakers.forEach((state, key) => {
      states[key] = state.state;
    });
    return states;
  }
}

// Export singleton instance
export const circuitBreakerService = new CircuitBreakerService();
