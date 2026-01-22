/**
 * Standardized API Response Helpers
 * 
 * Ensures consistent response format across all API endpoints
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ErrorCode, isAppError, toAppError } from './errors';
import { logger } from './logger';

/**
 * Standard API response format
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: Record<string, string>;
    pagination?: {
      total: number;
      limit: number;
      offset: number;
    };
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(options?.pagination && {
        pagination: {
          ...options.pagination,
          hasMore: options.pagination.total > options.pagination.offset + options.pagination.limit,
        },
      }),
    },
  };

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: Error | AppError | ZodError | string,
  options?: {
    status?: number;
    requestId?: string;
  }
): NextResponse<ApiResponse> {
  let appError: AppError;
  let details: any;

  if (typeof error === 'string') {
    appError = new AppError(ErrorCode.INTERNAL_ERROR, error);
  } else if (error instanceof ZodError) {
    appError = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed');
    details = error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (isAppError(error)) {
    appError = error;
    details = error.details;
  } else {
    appError = toAppError(error);
  }

  // Log error
  logger.error('API Error', error instanceof Error ? error : undefined, {
    code: appError.code,
    requestId: options?.requestId,
  });

  const response: ApiResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options?.requestId,
    },
  };

  return NextResponse.json(response, {
    status: options?.status || appError.statusCode,
  });
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  options?: { headers?: Record<string, string> }
): NextResponse<ApiResponse<T>> {
  return successResponse(data, { status: 201, headers: options?.headers });
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a not found response
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse(new AppError(ErrorCode.NOT_FOUND, `${resource} not found`));
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message?: string): NextResponse<ApiResponse> {
  return errorResponse(new AppError(ErrorCode.UNAUTHORIZED, message));
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message?: string): NextResponse<ApiResponse> {
  return errorResponse(new AppError(ErrorCode.FORBIDDEN, message));
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(errors: ZodError | Record<string, string>): NextResponse<ApiResponse> {
  if (errors instanceof ZodError) {
    return errorResponse(errors);
  }

  return errorResponse(new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', errors));
}

/**
 * API handler wrapper with automatic error handling
 */
export function withApiHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options?: { requireAuth?: boolean }
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = crypto.randomUUID();
    
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error : new Error(String(error)),
        { requestId }
      );
    }
  }) as T;
}

/**
 * Parse and validate request body with automatic error handling
 */
export async function parseBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: errorResponse(new AppError(ErrorCode.INVALID_INPUT, 'Invalid JSON body')),
      };
    }
    return {
      success: false,
      response: errorResponse(error instanceof Error ? error : new Error(String(error))),
    };
  }
}
