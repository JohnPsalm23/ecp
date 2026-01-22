/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at startup
 * Prevents runtime errors from missing configuration
 */

import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').optional(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // SendGrid
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  
  // HubSpot
  HUBSPOT_API_KEY: z.string().optional(),
  HUBSPOT_PORTAL_ID: z.string().optional(),
  
  // QuickBooks
  QUICKBOOKS_CLIENT_ID: z.string().optional(),
  QUICKBOOKS_CLIENT_SECRET: z.string().optional(),
  
  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Cron secret
  CRON_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
  }

  return parsed.data ?? (process.env as unknown as Env);
}

// Export validated env
export const env = validateEnv();

/**
 * Check if a feature is configured
 */
export const isConfigured = {
  stripe: () => Boolean(env.STRIPE_SECRET_KEY),
  openai: () => Boolean(env.OPENAI_API_KEY),
  twilio: () => Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
  sendgrid: () => Boolean(env.SENDGRID_API_KEY),
  hubspot: () => Boolean(env.HUBSPOT_API_KEY),
  quickbooks: () => Boolean(env.QUICKBOOKS_CLIENT_ID),
  googleMaps: () => Boolean(env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
  sentry: () => Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
};

/**
 * Get required env or throw
 */
export function requireEnv(key: keyof Env): string {
  const value = env[key];
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Runtime configuration check
 */
export function checkConfiguration(): {
  valid: boolean;
  missing: string[];
  configured: string[];
} {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optional = [
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'SENDGRID_API_KEY',
    'HUBSPOT_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  const configured = optional.filter(key => process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
    configured,
  };
}
