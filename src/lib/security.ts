/**
 * Security Utilities
 * 
 * Provides security headers, CSRF protection, and input sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com",
  ].join('; '),
};

/**
 * Apply security headers to response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(token: string, expected: string): boolean {
  if (!token || !expected) return false;
  
  try {
    const tokenBuffer = Buffer.from(token, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    
    if (tokenBuffer.length !== expectedBuffer.length) return false;
    
    return timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate webhook signature
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  timestamp: number = Date.now()
): { signature: string; timestamp: number } {
  const message = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  return {
    signature: `v1=${signature}`,
    timestamp,
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
  toleranceSeconds: number = 300
): boolean {
  // Check timestamp tolerance
  const timestampNum = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  
  if (Math.abs(now - timestampNum) > toleranceSeconds) {
    return false;
  }
  
  // Verify signature
  const message = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  const expected = `v1=${expectedSignature}`;
  
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends object>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  
  if (!origin) return true; // Same-origin requests
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://ecp-platform.vercel.app',
    // Add other allowed origins
  ].filter(Boolean);
  
  return allowedOrigins.some(allowed => origin === allowed);
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

/**
 * Hash sensitive data for logging
 */
export function hashForLogging(data: string): string {
  return createHmac('sha256', 'logging-salt')
    .update(data)
    .digest('hex')
    .slice(0, 16) + '...';
}

/**
 * Mask sensitive fields in object for logging
 */
export function maskSensitiveData<T extends object>(
  obj: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey', 'creditCard']
): T {
  const masked: any = { ...obj };
  
  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = '***REDACTED***';
    }
  }
  
  // Recursively mask nested objects
  for (const [key, value] of Object.entries(masked)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      masked[key] = maskSensitiveData(value as object, sensitiveFields);
    }
  }
  
  return masked;
}
