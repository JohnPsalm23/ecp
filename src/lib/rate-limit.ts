/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse using sliding window rate limiting
 */

import { NextRequest } from 'next/server';
import { AppError, ErrorCode } from './errors';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  keyPrefix?: string;    // Prefix for rate limit keys
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Default configurations for different endpoint types
export const RATE_LIMITS = {
  // Strict limits for auth endpoints
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: 'rl:auth' },
  
  // Standard API limits
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'rl:api' },
  
  // Relaxed limits for read operations
  read: { windowMs: 60 * 1000, maxRequests: 300, keyPrefix: 'rl:read' },
  
  // Strict limits for expensive operations
  expensive: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'rl:expensive' },
  
  // AI endpoint limits
  ai: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: 'rl:ai' },
  
  // Webhook limits
  webhook: { windowMs: 60 * 1000, maxRequests: 1000, keyPrefix: 'rl:webhook' },
} as const;

/**
 * In-memory rate limiter (suitable for single-instance deployments)
 * For production with multiple instances, use Redis-based implementation
 */
class InMemoryRateLimiter {
  private cache = new Map<string, { count: number; resetAt: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.resetAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const fullKey = `${config.keyPrefix}:${key}`;
    
    let entry = this.cache.get(fullKey);
    
    // If no entry or expired, create new
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + config.windowMs };
      this.cache.set(fullKey, entry);
    }
    
    entry.count++;
    
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const success = entry.count <= config.maxRequests;
    
    return {
      success,
      remaining,
      reset: entry.resetAt,
      retryAfter: success ? undefined : Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
const limiter = new InMemoryRateLimiter();

/**
 * Get rate limit key from request
 */
function getRateLimitKey(req: NextRequest, userId?: string): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limit middleware
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.api,
  userId?: string
): Promise<RateLimitResult> {
  const key = getRateLimitKey(req, userId);
  return limiter.check(key, config);
}

/**
 * Rate limit check with automatic error throwing
 */
export async function enforceRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.api,
  userId?: string
): Promise<void> {
  const result = await rateLimit(req, config, userId);
  
  if (!result.success) {
    throw new AppError(
      ErrorCode.RATE_LIMITED,
      `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      { retryAfter: result.retryAfter }
    );
  }
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
  };
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  config: RateLimitConfig = RATE_LIMITS.api
): T {
  return (async (...args: Parameters<T>) => {
    const req = args[0] as NextRequest;
    
    try {
      // Rate limit by IP (user ID would require auth client which may cause type issues)
      const result = await rateLimit(req, config);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMITED',
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...rateLimitHeaders(result),
            },
          }
        );
      }
      
      // Call original handler
      const response = await handler(...args);
      
      // Add rate limit headers to response
      const headers = new Headers(response.headers);
      Object.entries(rateLimitHeaders(result)).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      throw error;
    }
  }) as T;
}
