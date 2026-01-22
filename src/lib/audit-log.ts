/**
 * Audit Logging System
 * 
 * Provides comprehensive audit trails for compliance and debugging
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from './logger';
import { maskSensitiveData } from './security';

export enum AuditAction {
  // Authentication
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGE = 'auth.password_change',
  PASSWORD_RESET = 'auth.password_reset',
  MFA_ENABLED = 'auth.mfa_enabled',
  MFA_DISABLED = 'auth.mfa_disabled',
  
  // Users
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ROLE_CHANGED = 'user.role_changed',
  
  // Orders
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_STATUS_CHANGED = 'order.status_changed',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_ASSIGNED = 'order.assigned',
  ORDER_DELIVERED = 'order.delivered',
  
  // Appointments
  APPOINTMENT_SCHEDULED = 'appointment.scheduled',
  APPOINTMENT_RESCHEDULED = 'appointment.rescheduled',
  APPOINTMENT_CANCELLED = 'appointment.cancelled',
  APPOINTMENT_COMPLETED = 'appointment.completed',
  
  // QC
  QC_STARTED = 'qc.started',
  QC_PASSED = 'qc.passed',
  QC_FAILED = 'qc.failed',
  QC_OVERRIDE = 'qc.override',
  
  // Finance
  PAYMENT_RECEIVED = 'finance.payment_received',
  PAYMENT_REFUNDED = 'finance.payment_refunded',
  INVOICE_CREATED = 'finance.invoice_created',
  INVOICE_SENT = 'finance.invoice_sent',
  PAYROLL_PROCESSED = 'finance.payroll_processed',
  
  // Customers
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  CUSTOMER_DELETED = 'customer.deleted',
  
  // Photographers
  PHOTOGRAPHER_CREATED = 'photographer.created',
  PHOTOGRAPHER_UPDATED = 'photographer.updated',
  PHOTOGRAPHER_DEACTIVATED = 'photographer.deactivated',
  
  // Media
  MEDIA_UPLOADED = 'media.uploaded',
  MEDIA_DELETED = 'media.deleted',
  MEDIA_SHARED = 'media.shared',
  
  // Admin
  SETTINGS_CHANGED = 'admin.settings_changed',
  ROLE_CREATED = 'admin.role_created',
  PERMISSION_CHANGED = 'admin.permission_changed',
  EXPORT_REQUESTED = 'admin.export_requested',
  
  // API
  API_KEY_CREATED = 'api.key_created',
  API_KEY_REVOKED = 'api.key_revoked',
  WEBHOOK_CREATED = 'api.webhook_created',
  WEBHOOK_DELETED = 'api.webhook_deleted',
}

export interface AuditLogEntry {
  action: AuditAction;
  actor_id?: string;         // User who performed the action
  actor_type: 'user' | 'system' | 'api' | 'webhook';
  resource_type: string;     // e.g., 'order', 'user', 'appointment'
  resource_id?: string;      // ID of the affected resource
  company_id?: string;       // For multi-tenant filtering
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
}

/**
 * Write an audit log entry
 */
export async function audit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    // Mask sensitive data before logging
    const sanitizedEntry = {
      ...entry,
      changes: entry.changes ? {
        before: entry.changes.before ? maskSensitiveData(entry.changes.before) : undefined,
        after: entry.changes.after ? maskSensitiveData(entry.changes.after) : undefined,
      } : undefined,
      metadata: entry.metadata ? maskSensitiveData(entry.metadata) : undefined,
    };

    const { error } = await supabase.from('audit_logs').insert({
      action: sanitizedEntry.action,
      actor_id: sanitizedEntry.actor_id,
      actor_type: sanitizedEntry.actor_type,
      resource_type: sanitizedEntry.resource_type,
      resource_id: sanitizedEntry.resource_id,
      company_id: sanitizedEntry.company_id,
      changes: sanitizedEntry.changes,
      metadata: sanitizedEntry.metadata,
      ip_address: sanitizedEntry.ip_address,
      user_agent: sanitizedEntry.user_agent,
      request_id: sanitizedEntry.request_id,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Don't throw - audit logging should not break main operations
      logger.error('Failed to write audit log', new Error(error.message), {
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
      });
    }
  } catch (error) {
    logger.error('Audit logging error', error instanceof Error ? error : undefined);
  }
}

/**
 * Audit helper for common operations
 */
export const auditLog = {
  // Authentication
  login: (userId: string, metadata?: Record<string, any>) =>
    audit({
      action: AuditAction.LOGIN,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'session',
      resource_id: userId,
      metadata,
    }),

  logout: (userId: string) =>
    audit({
      action: AuditAction.LOGOUT,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'session',
      resource_id: userId,
    }),

  // Orders
  orderCreated: (orderId: string, userId: string, companyId: string, orderData: any) =>
    audit({
      action: AuditAction.ORDER_CREATED,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'order',
      resource_id: orderId,
      company_id: companyId,
      changes: { after: orderData },
    }),

  orderStatusChanged: (
    orderId: string,
    userId: string,
    companyId: string,
    previousStatus: string,
    newStatus: string
  ) =>
    audit({
      action: AuditAction.ORDER_STATUS_CHANGED,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'order',
      resource_id: orderId,
      company_id: companyId,
      changes: {
        before: { status: previousStatus },
        after: { status: newStatus },
      },
    }),

  // QC
  qcCompleted: (
    qcJobId: string,
    orderId: string,
    companyId: string,
    result: 'passed' | 'failed' | 'warning',
    score: number
  ) =>
    audit({
      action: result === 'passed' ? AuditAction.QC_PASSED : AuditAction.QC_FAILED,
      actor_type: 'system',
      resource_type: 'qc_job',
      resource_id: qcJobId,
      company_id: companyId,
      metadata: { order_id: orderId, result, score },
    }),

  qcOverride: (qcJobId: string, userId: string, companyId: string, reason: string) =>
    audit({
      action: AuditAction.QC_OVERRIDE,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'qc_job',
      resource_id: qcJobId,
      company_id: companyId,
      metadata: { reason },
    }),

  // Payments
  paymentReceived: (
    orderId: string,
    companyId: string,
    amount: number,
    paymentMethod: string
  ) =>
    audit({
      action: AuditAction.PAYMENT_RECEIVED,
      actor_type: 'system',
      resource_type: 'order',
      resource_id: orderId,
      company_id: companyId,
      metadata: { amount, payment_method: paymentMethod },
    }),

  // Settings
  settingsChanged: (
    userId: string,
    companyId: string,
    settingType: string,
    before: any,
    after: any
  ) =>
    audit({
      action: AuditAction.SETTINGS_CHANGED,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'settings',
      resource_id: settingType,
      company_id: companyId,
      changes: { before, after },
    }),

  // API
  apiKeyCreated: (keyId: string, userId: string, companyId: string, keyName: string) =>
    audit({
      action: AuditAction.API_KEY_CREATED,
      actor_id: userId,
      actor_type: 'user',
      resource_type: 'api_key',
      resource_id: keyId,
      company_id: companyId,
      metadata: { name: keyName },
    }),
};

/**
 * Query audit logs
 */
export async function queryAuditLogs(filters: {
  companyId?: string;
  actorId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const supabase = createAdminClient();
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.companyId) {
    query = query.eq('company_id', filters.companyId);
  }
  if (filters.actorId) {
    query = query.eq('actor_id', filters.actorId);
  }
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }
  if (filters.resourceId) {
    query = query.eq('resource_id', filters.resourceId);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}
