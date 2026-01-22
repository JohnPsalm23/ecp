/**
 * Outgoing Webhooks System
 * 
 * Sends webhook notifications to external systems for key events
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from './logger';
import { generateWebhookSignature } from './security';
import { retry } from './retry';

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  company_id: string;
  headers?: Record<string, string>;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
}

/**
 * Send webhook to all subscribers for an event
 */
export async function dispatchWebhook(
  companyId: string,
  event: string,
  data: Record<string, any>
): Promise<void> {
  const supabase = createAdminClient();

  // Get all active webhooks for this event
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('company_id', companyId)
    .eq('enabled', true)
    .contains('events', [event]);

  if (error) {
    logger.error('Failed to fetch webhooks', new Error(error.message));
    return;
  }

  if (!webhooks || webhooks.length === 0) {
    return;
  }

  // Send webhooks in parallel
  await Promise.allSettled(
    webhooks.map(webhook => sendWebhook(webhook as WebhookConfig, event, data))
  );
}

/**
 * Send a single webhook with retry logic
 */
async function sendWebhook(
  webhook: WebhookConfig,
  event: string,
  data: Record<string, any>
): Promise<WebhookDeliveryResult> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadStr = JSON.stringify(payload);
  const { signature, timestamp } = generateWebhookSignature(payloadStr, webhook.secret);

  const startTime = performance.now();

  try {
    const result = await retry(
      async () => {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': String(timestamp),
            'X-Webhook-Event': event,
            ...webhook.headers,
          },
          body: payloadStr,
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`);
        }

        return response;
      },
      { maxRetries: 3, initialDelay: 1000 }
    );

    const responseTime = Math.round(performance.now() - startTime);

    // Log successful delivery
    await logWebhookDelivery(webhook.id, event, {
      success: true,
      statusCode: result.status,
      responseTime,
    });

    return { success: true, statusCode: result.status, responseTime };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Webhook delivery failed', error instanceof Error ? error : undefined, {
      webhookId: webhook.id,
      event,
      url: webhook.url,
    });

    // Log failed delivery
    await logWebhookDelivery(webhook.id, event, {
      success: false,
      responseTime,
      error: errorMessage,
    });

    return { success: false, responseTime, error: errorMessage };
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(
  webhookId: string,
  event: string,
  result: WebhookDeliveryResult
): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from('webhook_deliveries').insert({
    webhook_id: webhookId,
    event,
    success: result.success,
    status_code: result.statusCode,
    response_time_ms: result.responseTime,
    error_message: result.error,
    created_at: new Date().toISOString(),
  });
}

/**
 * Webhook event types
 */
export const WebhookEvents = {
  // Orders
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_STATUS_CHANGED: 'order.status_changed',

  // Appointments
  APPOINTMENT_SCHEDULED: 'appointment.scheduled',
  APPOINTMENT_RESCHEDULED: 'appointment.rescheduled',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',

  // QC
  QC_COMPLETED: 'qc.completed',
  QC_PASSED: 'qc.passed',
  QC_FAILED: 'qc.failed',

  // Payments
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_ISSUED: 'refund.issued',

  // Invoices
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',

  // Media
  MEDIA_UPLOADED: 'media.uploaded',
  MEDIA_PROCESSED: 'media.processed',
  DELIVERY_READY: 'delivery.ready',

  // Customers
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
} as const;

/**
 * Helper to dispatch common webhook events
 */
export const webhooks = {
  orderCreated: (companyId: string, order: Record<string, any>) =>
    dispatchWebhook(companyId, WebhookEvents.ORDER_CREATED, order),

  orderStatusChanged: (companyId: string, orderId: string, status: string, previousStatus: string) =>
    dispatchWebhook(companyId, WebhookEvents.ORDER_STATUS_CHANGED, {
      order_id: orderId,
      status,
      previous_status: previousStatus,
    }),

  orderDelivered: (companyId: string, orderId: string, deliveryUrl: string) =>
    dispatchWebhook(companyId, WebhookEvents.ORDER_DELIVERED, {
      order_id: orderId,
      delivery_url: deliveryUrl,
    }),

  qcCompleted: (companyId: string, qcJobId: string, result: string, score: number) =>
    dispatchWebhook(companyId, WebhookEvents.QC_COMPLETED, {
      qc_job_id: qcJobId,
      result,
      score,
    }),

  paymentReceived: (companyId: string, orderId: string, amount: number) =>
    dispatchWebhook(companyId, WebhookEvents.PAYMENT_RECEIVED, {
      order_id: orderId,
      amount,
    }),

  mediaUploaded: (companyId: string, orderId: string, assetId: string, assetType: string) =>
    dispatchWebhook(companyId, WebhookEvents.MEDIA_UPLOADED, {
      order_id: orderId,
      asset_id: assetId,
      asset_type: assetType,
    }),
};
