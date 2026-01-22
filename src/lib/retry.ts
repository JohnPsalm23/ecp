/**
 * Retry Logic with Exponential Backoff
 * 
 * Handles transient failures in external service calls
 */

import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: isRetryableError,
};

/**
 * Default check for retryable errors
 */
function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }
  
  // Rate limiting (should be retried with backoff)
  if (error.message.includes('429') || error.message.includes('rate limit')) {
    return true;
  }
  
  // Server errors (5xx)
  if (error.message.includes('500') || 
      error.message.includes('502') || 
      error.message.includes('503') || 
      error.message.includes('504')) {
    return true;
  }
  
  // Database connection errors
  if (error.message.includes('connection') || 
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')) {
    return true;
  }
  
  return false;
}

/**
 * Calculate delay with jitter to prevent thundering herd
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25%)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.round(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      if (attempt > config.maxRetries || !config.retryableErrors(lastError)) {
        throw lastError;
      }
      
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier
      );
      
      logger.warn(`Retry attempt ${attempt}/${config.maxRetries}`, {
        error: lastError.message,
        delay,
      });
      
      if (config.onRetry) {
        config.onRetry(lastError, attempt, delay);
      }
      
      await sleep(delay);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Create a retryable version of a function
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retry(() => fn(...args), options);
  }) as T;
}

/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by temporarily blocking calls to failing services
 */
interface CircuitBreakerOptions {
  failureThreshold?: number;    // Number of failures before opening circuit
  resetTimeout?: number;        // Time in ms before attempting to close circuit
  monitoringWindow?: number;    // Time window for counting failures
}

type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private lastFailure: number = 0;
  private options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 60000,
      monitoringWindow: options.monitoringWindow ?? 60000,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from open to half-open
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailure >= this.options.resetTimeout) {
        this.state = 'half-open';
        logger.info('Circuit breaker transitioning to half-open');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      
      // Success - reset if in half-open state
      if (this.state === 'half-open') {
        this.reset();
        logger.info('Circuit breaker closed after successful call');
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    const now = Date.now();
    
    // Reset counter if outside monitoring window
    if (now - this.lastFailure > this.options.monitoringWindow) {
      this.failures = 0;
    }
    
    this.failures++;
    this.lastFailure = now;
    
    // Open circuit if threshold exceeded
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';
      logger.error('Circuit breaker opened due to failures', undefined, {
        failures: this.failures,
        threshold: this.options.failureThreshold,
      });
    }
  }

  private reset() {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailure = 0;
  }

  getState(): CircuitState {
    return this.state;
  }

  isOpen(): boolean {
    return this.state === 'open';
  }
}

// Circuit breakers for external services
export const circuitBreakers = {
  stripe: new CircuitBreaker({ failureThreshold: 5, resetTimeout: 60000 }),
  openai: new CircuitBreaker({ failureThreshold: 3, resetTimeout: 30000 }),
  hubspot: new CircuitBreaker({ failureThreshold: 5, resetTimeout: 120000 }),
  twilio: new CircuitBreaker({ failureThreshold: 5, resetTimeout: 60000 }),
  sendgrid: new CircuitBreaker({ failureThreshold: 5, resetTimeout: 60000 }),
};

/**
 * Wrapper that combines retry with circuit breaker
 */
export async function resilientCall<T>(
  serviceName: keyof typeof circuitBreakers,
  fn: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  const breaker = circuitBreakers[serviceName];
  
  return breaker.execute(() => 
    retry(fn, {
      ...retryOptions,
      onRetry: (error, attempt, delay) => {
        logger.warn(`${serviceName} call retry`, {
          attempt,
          delay,
          error: error.message,
        });
      },
    })
  );
}
