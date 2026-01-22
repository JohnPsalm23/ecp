/**
 * Sentry Error Monitoring Configuration
 * 
 * Provides error tracking, performance monitoring, and session replay
 */

// This file provides the integration point for Sentry
// To enable, install @sentry/nextjs and configure

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

const config: SentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
};

/**
 * Capture exception with additional context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: { id: string; email?: string };
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
) {
  // If Sentry is not configured, log to console
  if (!config.dsn) {
    console.error('[Sentry Stub] Error captured:', error.message, context);
    return;
  }

  // In production, this would call Sentry.captureException
  // Sentry.captureException(error, {
  //   tags: context?.tags,
  //   extra: context?.extra,
  //   user: context?.user,
  //   level: context?.level,
  // });
}

/**
 * Capture a custom message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  if (!config.dsn) {
    console.log(`[Sentry Stub] ${level.toUpperCase()}: ${message}`, context);
    return;
  }

  // Sentry.captureMessage(message, {
  //   level,
  //   extra: context,
  // });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; company_id?: string } | null) {
  if (!config.dsn) {
    console.log('[Sentry Stub] User set:', user);
    return;
  }

  // Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}) {
  if (!config.dsn) {
    console.log('[Sentry Stub] Breadcrumb:', breadcrumb);
    return;
  }

  // Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  if (!config.dsn) {
    const start = performance.now();
    return {
      finish: () => {
        const duration = performance.now() - start;
        console.log(`[Sentry Stub] Transaction "${name}" (${op}) completed in ${duration}ms`);
      },
      setData: (key: string, value: any) => {},
      setTag: (key: string, value: string) => {},
    };
  }

  // return Sentry.startTransaction({ name, op });
  return {
    finish: () => {},
    setData: () => {},
    setTag: () => {},
  };
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: { name?: string; tags?: Record<string, string> }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error instanceof Error ? error : new Error(String(error)), {
        tags: options?.tags,
        extra: { functionName: options?.name || fn.name, args },
      });
      throw error;
    }
  }) as T;
}

export { config as sentryConfig };
