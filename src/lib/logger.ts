/**
 * Structured Logging System
 * 
 * Provides consistent, structured logging for debugging and monitoring
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  companyId?: string;
  orderId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration?: number;
}

class Logger {
  private context: LogContext = {};
  private isProduction = process.env.NODE_ENV === 'production';

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
    return this;
  }

  clearContext() {
    this.context = {};
    return this;
  }

  private formatLog(entry: LogEntry): string {
    if (this.isProduction) {
      // JSON format for production (easier to parse in log aggregators)
      return JSON.stringify(entry);
    }
    
    // Pretty format for development
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? `\n  Error: ${entry.error.message}` : '';
    const durationStr = entry.duration ? ` (${entry.duration}ms)` : '';
    
    return `[${timestamp}] ${level} ${entry.message}${durationStr}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
      };
    }

    const output = this.formatLog(entry);

    switch (level) {
      case 'debug':
        if (!this.isProduction) console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }

    // In production, send to external logging service (e.g., Sentry, LogTail)
    if (this.isProduction && level === 'error') {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Integration point for Sentry, LogTail, Datadog, etc.
    // This would be implemented based on your monitoring stack
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }

  // Timing helper for performance monitoring
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = Math.round(performance.now() - start);
      this.info(`${label} completed`, { duration });
    };
  }

  // Create child logger with additional context
  child(context: LogContext): Logger {
    const child = new Logger();
    child.context = { ...this.context, ...context };
    return child;
  }
}

// Singleton instance
export const logger = new Logger();

// Request-scoped logger factory
export function createRequestLogger(requestId: string, userId?: string, companyId?: string) {
  return logger.child({ requestId, userId, companyId });
}
