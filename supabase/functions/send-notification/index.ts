import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Send Notification Function
 * 
 * Unified notification system supporting:
 * - SMS (Twilio)
 * - Email (SendGrid)
 * - Push notifications
 * - In-app messages
 */

interface NotificationRequest {
  type: 'sms' | 'email' | 'push' | 'in_app' | 'all';
  recipient: {
    user_id?: string;
    customer_id?: string;
    photographer_id?: string;
    email?: string;
    phone?: string;
  };
  template?: string;
  subject?: string;
  body: string;
  data?: Record<string, any>;
  context?: {
    order_id?: string;
    appointment_id?: string;
  };
}

async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: to,
          Body: body,
        }),
      }
    );

    const result = await response.json();
    return response.ok;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

async function sendEmail(to: string, subject: string, body: string, html?: string): Promise<boolean> {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');

  if (!apiKey || !fromEmail) {
    console.error('SendGrid credentials not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: 'ECP Platform' },
        subject,
        content: [
          { type: 'text/plain', value: body },
          ...(html ? [{ type: 'text/html', value: html }] : []),
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const request = await req.json() as NotificationRequest;

    // Get recipient contact info
    let email: string | undefined = request.recipient.email;
    let phone: string | undefined = request.recipient.phone;
    let companyId: string | undefined;

    if (request.recipient.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('email, phone, company_id')
        .eq('id', request.recipient.user_id)
        .single();

      if (user) {
        email = email || user.email;
        phone = phone || user.phone;
        companyId = user.company_id;
      }
    }

    if (request.recipient.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('email, phone, company_id')
        .eq('id', request.recipient.customer_id)
        .single();

      if (customer) {
        email = email || customer.email;
        phone = phone || customer.phone;
        companyId = customer.company_id;
      }
    }

    if (request.recipient.photographer_id) {
      const { data: photographer } = await supabase
        .from('photographers')
        .select('company_id, user:users(email, phone)')
        .eq('id', request.recipient.photographer_id)
        .single();

      if (photographer?.user) {
        email = email || photographer.user.email;
        phone = phone || photographer.user.phone;
        companyId = photographer.company_id;
      }
    }

    const results: Record<string, boolean> = {};

    // Send SMS
    if ((request.type === 'sms' || request.type === 'all') && phone) {
      results.sms = await sendSMS(phone, request.body);
    }

    // Send Email
    if ((request.type === 'email' || request.type === 'all') && email) {
      results.email = await sendEmail(
        email,
        request.subject || 'Notification from ECP Platform',
        request.body
      );
    }

    // Store in-app message
    if (request.type === 'in_app' || request.type === 'all') {
      const { error } = await supabase.from('messages').insert({
        company_id: companyId,
        sender_type: 'system',
        recipient_id: request.recipient.user_id,
        recipient_customer_id: request.recipient.customer_id,
        recipient_type: request.recipient.customer_id ? 'customer' : 'user',
        channel: 'in_app',
        subject: request.subject,
        body: request.body,
        order_id: request.context?.order_id,
        appointment_id: request.context?.appointment_id,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      });

      results.in_app = !error;
    }

    // Store message record for tracking
    await supabase.from('messages').insert({
      company_id: companyId,
      sender_type: 'system',
      recipient_id: request.recipient.user_id,
      recipient_customer_id: request.recipient.customer_id,
      recipient_type: request.recipient.customer_id ? 'customer' : 'user',
      channel: request.type === 'all' ? 'email' : request.type,
      subject: request.subject,
      body: request.body,
      order_id: request.context?.order_id,
      appointment_id: request.context?.appointment_id,
      status: Object.values(results).some(r => r) ? 'sent' : 'failed',
      sent_at: new Date().toISOString(),
      metadata: { results },
    });

    return new Response(
      JSON.stringify({
        success: Object.values(results).some(r => r),
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Send Notification Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
