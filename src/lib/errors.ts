/**
 * Centralized Error Handling System
 * 
 * Provides typed errors, error codes, and consistent error responses
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Business Logic
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  PHOTOGRAPHER_UNAVAILABLE = 'PHOTOGRAPHER_UNAVAILABLE',
  TIME_SLOT_UNAVAILABLE = 'TIME_SLOT_UNAVAILABLE',
  QC_FAILED = 'QC_FAILED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_COUPON = 'INVALID_COUPON',
  
  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // External Services
  STRIPE_ERROR = 'STRIPE_ERROR',
  HUBSPOT_ERROR = 'HUBSPOT_ERROR',
  TWILIO_ERROR = 'TWILIO_ERROR',
  OPENAI_ERROR = 'OPENAI_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

const ERROR_MAP: Record<ErrorCode, { message: string; statusCode: number }> = {
  [ErrorCode.UNAUTHORIZED]: { message: 'Authentication required', statusCode: 401 },
  [ErrorCode.FORBIDDEN]: { message: 'Access denied', statusCode: 403 },
  [ErrorCode.INVALID_TOKEN]: { message: 'Invalid or expired token', statusCode: 401 },
  [ErrorCode.SESSION_EXPIRED]: { message: 'Session has expired', statusCode: 401 },
  [ErrorCode.VALIDATION_ERROR]: { message: 'Validation failed', statusCode: 400 },
  [ErrorCode.INVALID_INPUT]: { message: 'Invalid input provided', statusCode: 400 },
  [ErrorCode.MISSING_REQUIRED_FIELD]: { message: 'Required field missing', statusCode: 400 },
  [ErrorCode.NOT_FOUND]: { message: 'Resource not found', statusCode: 404 },
  [ErrorCode.ALREADY_EXISTS]: { message: 'Resource already exists', statusCode: 409 },
  [ErrorCode.CONFLICT]: { message: 'Conflict with existing resource', statusCode: 409 },
  [ErrorCode.ORDER_CANCELLED]: { message: 'Order has been cancelled', statusCode: 400 },
  [ErrorCode.INSUFFICIENT_CREDITS]: { message: 'Insufficient credits', statusCode: 402 },
  [ErrorCode.PHOTOGRAPHER_UNAVAILABLE]: { message: 'Photographer is not available', statusCode: 400 },
  [ErrorCode.TIME_SLOT_UNAVAILABLE]: { message: 'Time slot is not available', statusCode: 400 },
  [ErrorCode.QC_FAILED]: { message: 'Quality control check failed', statusCode: 400 },
  [ErrorCode.PAYMENT_FAILED]: { message: 'Payment processing failed', statusCode: 402 },
  [ErrorCode.INVALID_COUPON]: { message: 'Coupon is invalid or expired', statusCode: 400 },
  [ErrorCode.RATE_LIMITED]: { message: 'Rate limit exceeded', statusCode: 429 },
  [ErrorCode.TOO_MANY_REQUESTS]: { message: 'Too many requests', statusCode: 429 },
  [ErrorCode.STRIPE_ERROR]: { message: 'Payment service error', statusCode: 502 },
  [ErrorCode.HUBSPOT_ERROR]: { message: 'CRM service error', statusCode: 502 },
  [ErrorCode.TWILIO_ERROR]: { message: 'Messaging service error', statusCode: 502 },
  [ErrorCode.OPENAI_ERROR]: { message: 'AI service error', statusCode: 502 },
  [ErrorCode.STORAGE_ERROR]: { message: 'Storage service error', statusCode: 502 },
  [ErrorCode.INTERNAL_ERROR]: { message: 'Internal server error', statusCode: 500 },
  [ErrorCode.SERVICE_UNAVAILABLE]: { message: 'Service temporarily unavailable', statusCode: 503 },
  [ErrorCode.DATABASE_ERROR]: { message: 'Database error', statusCode: 500 },
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly isOperational: boolean;

  constructor(code: ErrorCode, message?: string, details?: Record<string, any>) {
    const errorInfo = ERROR_MAP[code];
    super(message || errorInfo.message);
    
    this.code = code;
    this.statusCode = errorInfo.statusCode;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

// Convenience factory functions
export const Errors = {
  unauthorized: (message?: string) => new AppError(ErrorCode.UNAUTHORIZED, message),
  forbidden: (message?: string) => new AppError(ErrorCode.FORBIDDEN, message),
  notFound: (resource: string) => new AppError(ErrorCode.NOT_FOUND, `${resource} not found`),
  validation: (details: Record<string, any>) => new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', details),
  conflict: (message: string) => new AppError(ErrorCode.CONFLICT, message),
  rateLimit: () => new AppError(ErrorCode.RATE_LIMITED),
  internal: (message?: string) => new AppError(ErrorCode.INTERNAL_ERROR, message),
  database: (message?: string) => new AppError(ErrorCode.DATABASE_ERROR, message),
  stripe: (message?: string, details?: Record<string, any>) => new AppError(ErrorCode.STRIPE_ERROR, message, details),
  openai: (message?: string) => new AppError(ErrorCode.OPENAI_ERROR, message),
};

// Type guard
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Convert unknown errors to AppError
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(ErrorCode.INTERNAL_ERROR, error.message);
  }
  
  return new AppError(ErrorCode.INTERNAL_ERROR, 'An unexpected error occurred');
}
