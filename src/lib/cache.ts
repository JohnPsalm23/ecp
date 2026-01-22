/**
 * Caching Layer
 * 
 * Provides in-memory caching with TTL support
 * For production, consider upgrading to Redis via Upstash
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get or set with callback
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttlSeconds);
    return value;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();

/**
 * Cache key generators
 */
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userRoles: (userId: string) => `user:${userId}:roles`,
  company: (companyId: string) => `company:${companyId}`,
  market: (marketId: string) => `market:${marketId}`,
  markets: (companyId: string) => `company:${companyId}:markets`,
  products: (companyId: string) => `company:${companyId}:products`,
  order: (orderId: string) => `order:${orderId}`,
  photographer: (photographerId: string) => `photographer:${photographerId}`,
  photographerAvailability: (photographerId: string, date: string) => 
    `photographer:${photographerId}:availability:${date}`,
  featureFlags: (companyId: string) => `company:${companyId}:feature-flags`,
  analytics: (companyId: string, metric: string) => 
    `company:${companyId}:analytics:${metric}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const cacheTTL = {
  short: 60,           // 1 minute - for frequently changing data
  medium: 300,         // 5 minutes - for moderately changing data
  long: 3600,          // 1 hour - for rarely changing data
  veryLong: 86400,     // 24 hours - for static data
};

/**
 * Decorator for caching function results
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  ttlSeconds: number = cacheTTL.medium
) {
  return function (fn: T): T {
    return (async (...args: Parameters<T>) => {
      const key = keyGenerator(...args);
      return cache.getOrSet(key, () => fn(...args), ttlSeconds);
    }) as T;
  };
}

/**
 * Invalidate cache for a resource
 */
export function invalidateCache(patterns: string[]): void {
  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      cache.deletePattern(pattern);
    } else {
      cache.delete(pattern);
    }
  }
}

/**
 * Invalidate cache on data mutations
 */
export const invalidateOn = {
  userUpdate: (userId: string) => {
    cache.delete(cacheKeys.user(userId));
    cache.delete(cacheKeys.userRoles(userId));
  },
  
  companyUpdate: (companyId: string) => {
    cache.deletePattern(`company:${companyId}*`);
  },
  
  orderUpdate: (orderId: string, companyId: string) => {
    cache.delete(cacheKeys.order(orderId));
    cache.deletePattern(`company:${companyId}:analytics*`);
  },
  
  photographerUpdate: (photographerId: string) => {
    cache.deletePattern(`photographer:${photographerId}*`);
  },
  
  productUpdate: (companyId: string) => {
    cache.delete(cacheKeys.products(companyId));
  },
};
