/**
 * Feature Flags System
 * 
 * Enables safe rollout of new features with:
 * - Company-level flags
 * - User-level flags
 * - Percentage-based rollouts
 * - Environment-based flags
 */

interface FeatureFlag {
  name: string;
  enabled: boolean;
  percentage?: number;      // For gradual rollouts (0-100)
  companies?: string[];     // Specific company IDs
  users?: string[];         // Specific user IDs
  environments?: string[];  // 'development', 'staging', 'production'
  startDate?: string;       // Enable after this date
  endDate?: string;         // Disable after this date
  metadata?: Record<string, any>;
}

// Default feature flags (can be overridden by database)
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  'ai-qc-analysis': {
    name: 'AI QC Analysis',
    enabled: true,
    environments: ['production', 'staging', 'development'],
  },
  'ai-scheduling': {
    name: 'AI-Powered Scheduling',
    enabled: true,
    environments: ['production', 'staging'],
  },
  'ai-chat': {
    name: 'AI Chat Assistant',
    enabled: true,
    percentage: 100,
  },
  'new-dashboard': {
    name: 'New Dashboard UI',
    enabled: false,
    percentage: 10, // 10% of users
  },
  'mobile-app-upload': {
    name: 'Mobile App Direct Upload',
    enabled: true,
  },
  'hubspot-sync': {
    name: 'HubSpot CRM Sync',
    enabled: true,
  },
  'quickbooks-sync': {
    name: 'QuickBooks Sync',
    enabled: true,
  },
  'stripe-invoicing': {
    name: 'Stripe Invoicing',
    enabled: true,
  },
  'photographer-app-v2': {
    name: 'Photographer App V2',
    enabled: false,
    companies: [], // Specific companies for beta
  },
  'advanced-analytics': {
    name: 'Advanced Analytics Dashboard',
    enabled: true,
    environments: ['production'],
  },
};

/**
 * Check if a feature flag is enabled
 */
export async function isFeatureEnabled(
  flagName: string,
  context?: {
    userId?: string;
    companyId?: string;
  }
): Promise<boolean> {
  const flag = DEFAULT_FLAGS[flagName];
  
  if (!flag) {
    console.warn(`Feature flag "${flagName}" not found`);
    return false;
  }

  // Check if globally disabled
  if (!flag.enabled) {
    return false;
  }

  // Check environment
  const currentEnv = process.env.NODE_ENV || 'development';
  if (flag.environments && !flag.environments.includes(currentEnv)) {
    return false;
  }

  // Check date range
  const now = new Date();
  if (flag.startDate && new Date(flag.startDate) > now) {
    return false;
  }
  if (flag.endDate && new Date(flag.endDate) < now) {
    return false;
  }

  // Check company-specific flags
  if (flag.companies?.length && context?.companyId) {
    if (flag.companies.includes(context.companyId)) {
      return true;
    }
  }

  // Check user-specific flags
  if (flag.users?.length && context?.userId) {
    if (flag.users.includes(context.userId)) {
      return true;
    }
  }

  // Check percentage-based rollout
  if (flag.percentage !== undefined && context?.userId) {
    const hash = simpleHash(context.userId + flagName);
    const bucket = hash % 100;
    return bucket < flag.percentage;
  }

  // If no specific rules, use the enabled flag
  return flag.enabled;
}

/**
 * Get all feature flags for a user
 */
export async function getFeatureFlags(context?: {
  userId?: string;
  companyId?: string;
}): Promise<Record<string, boolean>> {
  const flags: Record<string, boolean> = {};

  for (const flagName of Object.keys(DEFAULT_FLAGS)) {
    flags[flagName] = await isFeatureEnabled(flagName, context);
  }

  return flags;
}

/**
 * Simple hash function for percentage-based rollouts
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * React hook for feature flags (client-side)
 */
export function useFeatureFlag(
  flagName: string,
  context?: { userId?: string; companyId?: string }
): boolean {
  // For client-side, we'd need to fetch flags from an API endpoint
  // This is a simplified version that checks defaults
  const flag = DEFAULT_FLAGS[flagName];
  
  if (!flag || !flag.enabled) {
    return false;
  }

  const currentEnv = process.env.NODE_ENV || 'development';
  if (flag.environments && !flag.environments.includes(currentEnv)) {
    return false;
  }

  return flag.enabled;
}

/**
 * Decorator for feature-flagged functions
 */
export function withFeatureFlag<T extends (...args: any[]) => Promise<any>>(
  flagName: string,
  fn: T,
  fallback?: T
): T {
  return (async (...args: Parameters<T>) => {
    const enabled = await isFeatureEnabled(flagName);
    
    if (!enabled) {
      if (fallback) {
        return fallback(...args);
      }
      throw new Error(`Feature "${flagName}" is not enabled`);
    }

    return fn(...args);
  }) as T;
}

/**
 * Feature flag middleware for API routes
 */
export async function requireFeatureFlag(
  flagName: string,
  context?: { userId?: string; companyId?: string }
): Promise<void> {
  const enabled = await isFeatureEnabled(flagName, context);
  
  if (!enabled) {
    throw new Error(`This feature is not available`);
  }
}
