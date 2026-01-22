/**
 * Retry Service
 * Handles retry logic with exponential backoff and jitter
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryService {
  /**
   * Retry operation with exponential backoff
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    const { maxRetries, baseDelay, maxDelay, jitter, onRetry } = config;
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

        // Add jitter if enabled (0-1000ms random)
        const jitterDelay = jitter ? Math.random() * 1000 : 0;
        const finalDelay = delay + jitterDelay;

        console.log(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${finalDelay.toFixed(0)}ms - Error: ${lastError.message}`
        );

        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await this.sleep(finalDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const retryService = new RetryService();
