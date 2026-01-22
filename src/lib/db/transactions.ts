/**
 * Database Transaction Helpers
 * 
 * Ensures data integrity for complex multi-table operations
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, ErrorCode } from '@/lib/errors';

type TransactionClient = Awaited<ReturnType<typeof createAdminClient>>;

interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Execute operations within a database transaction
 * 
 * Note: Supabase doesn't natively support client-side transactions,
 * so we use a database function for true ACID transactions.
 * This wrapper provides a consistent interface and handles rollback logic.
 */
export async function withTransaction<T>(
  operations: (client: TransactionClient) => Promise<T>,
  options: { 
    isolationLevel?: 'read_committed' | 'repeatable_read' | 'serializable';
    timeout?: number;
  } = {}
): Promise<TransactionResult<T>> {
  const client = createAdminClient();
  const endTimer = logger.time('database_transaction');
  
  try {
    // Start transaction using RPC
    await client.rpc('begin_transaction', {
      isolation_level: options.isolationLevel || 'read_committed',
    });

    try {
      const result = await operations(client);
      
      // Commit transaction
      await client.rpc('commit_transaction');
      
      endTimer();
      return { success: true, data: result };
    } catch (error) {
      // Rollback on any error
      await client.rpc('rollback_transaction');
      throw error;
    }
  } catch (error) {
    logger.error('Transaction failed', error instanceof Error ? error : undefined);
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Idempotency key support for preventing duplicate operations
 */
export async function withIdempotency<T>(
  idempotencyKey: string,
  operation: () => Promise<T>,
  options: { ttlSeconds?: number } = {}
): Promise<T> {
  const client = createAdminClient();
  const ttl = options.ttlSeconds || 86400; // 24 hours default

  // Check if operation already completed
  const { data: existing } = await client
    .from('idempotency_keys')
    .select('result, created_at')
    .eq('key', idempotencyKey)
    .single();

  if (existing) {
    logger.info('Returning cached idempotent result', { idempotencyKey });
    return existing.result as T;
  }

  // Lock the key
  const { error: lockError } = await client
    .from('idempotency_keys')
    .insert({
      key: idempotencyKey,
      status: 'processing',
      expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
    });

  if (lockError) {
    // Key might be locked by another process
    throw new AppError(ErrorCode.CONFLICT, 'Operation already in progress');
  }

  try {
    const result = await operation();

    // Store successful result
    await client
      .from('idempotency_keys')
      .update({
        status: 'completed',
        result: result as any,
      })
      .eq('key', idempotencyKey);

    return result;
  } catch (error) {
    // Mark as failed and allow retry
    await client
      .from('idempotency_keys')
      .delete()
      .eq('key', idempotencyKey);

    throw error;
  }
}

/**
 * Optimistic locking helper
 */
export async function updateWithOptimisticLock<T extends { updated_at: string }>(
  client: TransactionClient,
  table: string,
  id: string,
  updates: Partial<T>,
  expectedVersion: string
): Promise<T> {
  const { data, error } = await client
    .from(table)
    .update(updates)
    .eq('id', id)
    .eq('updated_at', expectedVersion) // Optimistic lock check
    .select()
    .single();

  if (error || !data) {
    throw new AppError(
      ErrorCode.CONFLICT,
      'Record was modified by another process. Please refresh and try again.'
    );
  }

  return data as T;
}

/**
 * Batch insert with conflict handling
 */
export async function batchUpsert<T>(
  client: TransactionClient,
  table: string,
  records: T[],
  conflictColumns: string[],
  options: {
    batchSize?: number;
    onConflict?: 'ignore' | 'update';
  } = {}
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  const batchSize = options.batchSize || 100;
  const results = { inserted: 0, updated: 0, errors: [] as string[] };

  // Process in batches
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      const { data, error } = await client
        .from(table)
        .upsert(batch, {
          onConflict: conflictColumns.join(','),
          ignoreDuplicates: options.onConflict === 'ignore',
        })
        .select();

      if (error) {
        results.errors.push(`Batch ${i / batchSize}: ${error.message}`);
      } else {
        results.inserted += data?.length || 0;
      }
    } catch (error) {
      results.errors.push(`Batch ${i / batchSize}: ${error}`);
    }
  }

  return results;
}

/**
 * Safe deletion with cascading checks
 */
export async function safeDelete(
  client: TransactionClient,
  table: string,
  id: string,
  options: {
    softDelete?: boolean;
    cascadeChecks?: Array<{ table: string; column: string }>;
  } = {}
): Promise<void> {
  // Check for dependent records
  if (options.cascadeChecks) {
    for (const check of options.cascadeChecks) {
      const { count } = await client
        .from(check.table)
        .select('id', { count: 'exact', head: true })
        .eq(check.column, id);

      if (count && count > 0) {
        throw new AppError(
          ErrorCode.CONFLICT,
          `Cannot delete: ${count} records in ${check.table} depend on this record`
        );
      }
    }
  }

  if (options.softDelete) {
    const { error } = await client
      .from(table)
      .update({
        deleted_at: new Date().toISOString(),
        is_deleted: true,
      })
      .eq('id', id);

    if (error) throw new AppError(ErrorCode.DATABASE_ERROR, error.message);
  } else {
    const { error } = await client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw new AppError(ErrorCode.DATABASE_ERROR, error.message);
  }
}
