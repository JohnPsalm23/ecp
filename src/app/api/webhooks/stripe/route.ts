import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update order payment status
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'succeeded',
            paid_at: new Date().toISOString(),
            status: 'confirmed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update order:', error);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.metadata?.invoice_id) {
          await supabase
            .from('customer_invoices')
            .update({
              status: 'paid',
              amount_paid: (invoice.amount_paid || 0) / 100,
            })
            .eq('id', invoice.metadata.invoice_id);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('companies')
          .update({
            stripe_subscription_id: event.type === 'customer.subscription.deleted' 
              ? null 
              : subscription.id,
          })
          .eq('stripe_customer_id', subscription.customer as string);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        if (charge.payment_intent) {
          await supabase
            .from('orders')
            .update({
              payment_status: charge.amount_refunded === charge.amount 
                ? 'refunded' 
                : 'partially_refunded',
            })
            .eq('stripe_payment_intent_id', charge.payment_intent as string);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
