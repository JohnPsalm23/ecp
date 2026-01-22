import {
  AppError,
  ErrorCode,
  Errors,
  isAppError,
  toAppError,
} from '@/lib/errors';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with code', () => {
      const error = new AppError(ErrorCode.NOT_FOUND);
      
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom message', () => {
      const error = new AppError(ErrorCode.NOT_FOUND, 'User not found');
      
      expect(error.message).toBe('User not found');
    });

    it('should include details', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, undefined, details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('toJSON', () => {
    it('should serialize correctly', () => {
      const error = new AppError(ErrorCode.UNAUTHORIZED);
      const json = error.toJSON();
      
      expect(json).toEqual({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        details: undefined,
        statusCode: 401,
      });
    });
  });

  describe('status codes', () => {
    it('should map authentication errors to 401', () => {
      expect(new AppError(ErrorCode.UNAUTHORIZED).statusCode).toBe(401);
      expect(new AppError(ErrorCode.INVALID_TOKEN).statusCode).toBe(401);
    });

    it('should map forbidden to 403', () => {
      expect(new AppError(ErrorCode.FORBIDDEN).statusCode).toBe(403);
    });

    it('should map not found to 404', () => {
      expect(new AppError(ErrorCode.NOT_FOUND).statusCode).toBe(404);
    });

    it('should map validation errors to 400', () => {
      expect(new AppError(ErrorCode.VALIDATION_ERROR).statusCode).toBe(400);
    });

    it('should map rate limiting to 429', () => {
      expect(new AppError(ErrorCode.RATE_LIMITED).statusCode).toBe(429);
    });

    it('should map internal errors to 500', () => {
      expect(new AppError(ErrorCode.INTERNAL_ERROR).statusCode).toBe(500);
    });

    it('should map external service errors to 502', () => {
      expect(new AppError(ErrorCode.STRIPE_ERROR).statusCode).toBe(502);
      expect(new AppError(ErrorCode.OPENAI_ERROR).statusCode).toBe(502);
    });
  });
});

describe('Errors factory', () => {
  it('should create unauthorized error', () => {
    const error = Errors.unauthorized();
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('should create forbidden error', () => {
    const error = Errors.forbidden('Admin only');
    expect(error.code).toBe(ErrorCode.FORBIDDEN);
    expect(error.message).toBe('Admin only');
  });

  it('should create not found error', () => {
    const error = Errors.notFound('Order');
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe('Order not found');
  });

  it('should create validation error with details', () => {
    const details = { email: 'Invalid format' };
    const error = Errors.validation(details);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.details).toEqual(details);
  });
});

describe('isAppError', () => {
  it('should return true for AppError', () => {
    const error = new AppError(ErrorCode.NOT_FOUND);
    expect(isAppError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Something went wrong');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('toAppError', () => {
  it('should return same error if already AppError', () => {
    const error = new AppError(ErrorCode.NOT_FOUND);
    expect(toAppError(error)).toBe(error);
  });

  it('should convert regular Error', () => {
    const error = new Error('Something went wrong');
    const appError = toAppError(error);
    
    expect(appError.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(appError.message).toBe('Something went wrong');
  });

  it('should handle non-Error values', () => {
    const appError = toAppError('string error');
    
    expect(appError.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(appError.message).toBe('An unexpected error occurred');
  });
});
