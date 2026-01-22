/**
 * Comprehensive Zod Validation Schemas
 * 
 * All API inputs should be validated using these schemas
 */

import { z } from 'zod';

// ===========================================
// Common Schemas
// ===========================================

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM or HH:MM:SS format');

export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  'Invalid timezone'
);

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===========================================
// Address Schema
// ===========================================

export const addressSchema = z.object({
  address_line1: z.string().min(1, 'Address is required').max(255),
  address_line2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(2).max(50),
  postal_code: z.string().min(3).max(20),
  country: z.string().default('US'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// ===========================================
// Customer Schemas
// ===========================================

export const createCustomerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  business_name: z.string().max(255).optional(),
  business_type: z.enum(['agent', 'broker', 'property_manager', 'builder', 'other']).optional(),
  license_number: z.string().max(100).optional(),
  primary_market_id: uuidSchema.optional(),
  billing_email: emailSchema.optional(),
  payment_terms: z.number().int().min(0).max(90).default(0),
  referral_source: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ===========================================
// Order Schemas
// ===========================================

export const orderStatusSchema = z.enum([
  'draft',
  'pending_payment',
  'confirmed',
  'scheduled',
  'en_route',
  'started',
  'completed',
  'uploading',
  'editing',
  'qc_pending',
  'qc_failed',
  'qc_passed',
  'delivered',
  'cancelled',
  'on_hold',
]);

export const orderItemSchema = z.object({
  product_id: uuidSchema,
  quantity: z.number().int().positive().default(1),
});

export const createOrderSchema = z.object({
  customer_id: uuidSchema,
  market_id: uuidSchema,
  property: addressSchema,
  products: z.array(orderItemSchema).min(1, 'At least one product is required'),
  preferred_date: dateSchema.optional(),
  preferred_time_start: timeSchema.optional(),
  preferred_time_end: timeSchema.optional(),
  is_flexible_time: z.boolean().default(false),
  is_rush: z.boolean().default(false),
  customer_notes: z.string().max(2000).optional(),
  coupon_code: z.string().max(50).optional(),
}).refine(
  (data) => {
    if (data.preferred_time_start && data.preferred_time_end) {
      return data.preferred_time_start < data.preferred_time_end;
    }
    return true;
  },
  { message: 'End time must be after start time', path: ['preferred_time_end'] }
);

export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  preferred_date: dateSchema.optional(),
  preferred_time_start: timeSchema.optional(),
  preferred_time_end: timeSchema.optional(),
  customer_notes: z.string().max(2000).optional(),
  internal_notes: z.string().max(5000).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
  refund_amount: z.number().min(0).optional(),
});

// ===========================================
// Appointment Schemas
// ===========================================

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled',
]);

export const createAppointmentSchema = z.object({
  order_id: uuidSchema,
  scheduled_date: dateSchema,
  scheduled_start_time: timeSchema,
  scheduled_end_time: timeSchema,
  timezone: timezoneSchema,
  estimated_duration_minutes: z.number().int().positive().max(480),
  photographer_id: uuidSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  scheduled_date: dateSchema,
  scheduled_start_time: timeSchema,
  scheduled_end_time: timeSchema,
  reason: z.string().min(1).max(500),
});

export const checkInSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ===========================================
// Photographer Schemas
// ===========================================

export const photographerSkillSchema = z.enum([
  'photo',
  'video',
  'drone',
  'matterport',
  'floor_plan',
  'virtual_staging',
  'twilight',
]);

export const createPhotographerSchema = z.object({
  user_id: uuidSchema,
  bio: z.string().max(2000).optional(),
  home_address: addressSchema.optional(),
  primary_market_id: uuidSchema.optional(),
  service_radius_miles: z.number().int().min(1).max(100).default(30),
  skills: z.array(photographerSkillSchema).min(1),
  hourly_rate: z.number().min(0).optional(),
  per_job_base_rate: z.number().min(0).optional(),
  max_daily_jobs: z.number().int().min(1).max(20).default(8),
});

export const updatePhotographerAvailabilitySchema = z.object({
  is_available: z.boolean(),
  unavailable_until: z.string().datetime().optional(),
  reason: z.string().max(500).optional(),
});

// ===========================================
// QC Schemas
// ===========================================

export const qcStatusSchema = z.enum([
  'pending',
  'in_progress',
  'passed',
  'warning',
  'failed',
  'override_approved',
]);

export const qcOverrideSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const qcIssueResolutionSchema = z.object({
  resolution_method: z.enum(['edited', 'reshot', 'waived']),
  resolution_notes: z.string().max(1000).optional(),
});

// ===========================================
// Finance Schemas
// ===========================================

export const paymentMethodSchema = z.enum([
  'credit_card',
  'ach',
  'check',
  'cash',
  'other',
]);

export const processPaymentSchema = z.object({
  order_id: uuidSchema,
  payment_method_id: z.string(), // Stripe payment method ID
  save_payment_method: z.boolean().default(false),
});

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_product']),
  discount_value: z.number().positive(),
  max_discount_amount: z.number().positive().optional(),
  minimum_order_value: z.number().min(0).optional(),
  max_uses: z.number().int().positive().optional(),
  max_uses_per_customer: z.number().int().positive().default(1),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
});

// ===========================================
// Mileage Schema
// ===========================================

export const createMileageLogSchema = z.object({
  appointment_id: uuidSchema.optional(),
  log_date: dateSchema,
  start_address: z.string().min(1).max(500),
  start_lat: z.number().min(-90).max(90).optional(),
  start_lng: z.number().min(-180).max(180).optional(),
  end_address: z.string().min(1).max(500),
  end_lat: z.number().min(-90).max(90).optional(),
  end_lng: z.number().min(-180).max(180).optional(),
  distance_miles: z.number().positive().max(500),
  notes: z.string().max(1000).optional(),
});

// ===========================================
// Availability Schemas
// ===========================================

export const availabilityTypeSchema = z.enum([
  'available',
  'unavailable',
  'tentative',
  'time_off',
  'holiday',
]);

export const createAvailabilityBlockSchema = z.object({
  availability_type: availabilityTypeSchema,
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  timezone: timezoneSchema,
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().optional(), // iCal RRULE format
  recurrence_end: dateSchema.optional(),
  title: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.start_time) < new Date(data.end_time),
  { message: 'End time must be after start time', path: ['end_time'] }
);

// ===========================================
// Message Schemas
// ===========================================

export const sendMessageSchema = z.object({
  recipient_id: uuidSchema.optional(),
  recipient_customer_id: uuidSchema.optional(),
  channel: z.enum(['in_app', 'sms', 'email']),
  subject: z.string().max(255).optional(),
  body: z.string().min(1).max(10000),
  order_id: uuidSchema.optional(),
}).refine(
  (data) => data.recipient_id || data.recipient_customer_id,
  { message: 'Either recipient_id or recipient_customer_id is required' }
);

// ===========================================
// Review Schemas
// ===========================================

export const createReviewSchema = z.object({
  order_id: uuidSchema,
  overall_rating: z.number().int().min(1).max(5),
  quality_rating: z.number().int().min(1).max(5).optional(),
  communication_rating: z.number().int().min(1).max(5).optional(),
  punctuality_rating: z.number().int().min(1).max(5).optional(),
  professionalism_rating: z.number().int().min(1).max(5).optional(),
  value_rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  content: z.string().max(5000).optional(),
});

// ===========================================
// Webhook Schemas
// ===========================================

export const createWebhookSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(16).max(255).optional(),
  headers: z.record(z.string()).optional(),
});

// ===========================================
// Export validation helper
// ===========================================

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}
