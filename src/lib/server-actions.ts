/**
 * Server Action Utilities
 * 
 * Provides type-safe, authenticated server actions with error handling
 */

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from './logger';
import { AppError, ErrorCode, toAppError } from './errors';
import { ZodError, ZodSchema } from 'zod';
import { cache } from './cache';

/**
 * Standard action result type
 */
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: any };

/**
 * Create a type-safe server action with authentication and error handling
 */
export function createAction<TInput, TOutput>(config: {
  input?: ZodSchema<TInput>;
  requireAuth?: boolean;
  requireRoles?: string[];
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>;
}): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input: TInput) => {
    const startTime = performance.now();
    
    try {
      // Validate input
      let validatedInput = input;
      if (config.input) {
        try {
          validatedInput = config.input.parse(input);
        } catch (error) {
          if (error instanceof ZodError) {
            return {
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: error.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message,
              })),
            };
          }
          throw error;
        }
      }

      // Get authentication context
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Check authentication
      if (config.requireAuth !== false && !user) {
        return {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        };
      }

      // Check roles
      if (config.requireRoles?.length && user) {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id);

        const roles = userRoles?.map((r: any) => r.roles?.name).filter(Boolean) || [];
        const hasRole = config.requireRoles.some(role => roles.includes(role));

        if (!hasRole) {
          return {
            success: false,
            error: 'Insufficient permissions',
            code: 'FORBIDDEN',
          };
        }
      }

      // Get company context
      let companyId: string | undefined;
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
        companyId = userData?.company_id;
      }

      const ctx: ActionContext = {
        user: user ? {
          id: user.id,
          email: user.email!,
        } : undefined,
        companyId,
        supabase,
      };

      // Execute handler
      const result = await config.handler(validatedInput, ctx);

      const duration = Math.round(performance.now() - startTime);
      logger.debug('Action completed', { duration });

      return { success: true, data: result };
    } catch (error) {
      const appError = toAppError(error);

      logger.error('Action failed', error instanceof Error ? error : undefined);

      return {
        success: false,
        error: appError.message,
        code: appError.code,
        details: appError.details,
      };
    }
  };
}

/**
 * Action context passed to handlers
 */
export interface ActionContext {
  user?: {
    id: string;
    email: string;
  };
  companyId?: string;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
}

/**
 * Create a public action (no authentication required)
 */
export function createPublicAction<TInput, TOutput>(config: {
  input?: ZodSchema<TInput>;
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>;
}) {
  return createAction({
    ...config,
    requireAuth: false,
  });
}

/**
 * Create an admin-only action
 */
export function createAdminAction<TInput, TOutput>(config: {
  input?: ZodSchema<TInput>;
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>;
}) {
  return createAction({
    ...config,
    requireAuth: true,
    requireRoles: ['admin', 'owner', 'super_admin'],
  });
}

/**
 * Revalidation helper for after mutations
 */
export async function invalidateCache(patterns: string[]): Promise<void> {
  const { revalidatePath, revalidateTag } = await import('next/cache');
  
  for (const pattern of patterns) {
    if (pattern.startsWith('/')) {
      revalidatePath(pattern);
    } else {
      revalidateTag(pattern);
    }
  }
}
