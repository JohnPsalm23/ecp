import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Generate Invoice Function
 * 
 * Creates customer or photographer invoices with proper line items.
 */

interface GenerateInvoiceRequest {
  type: 'customer' | 'photographer';
  // For customer invoices
  customer_id?: string;
  order_ids?: string[];
  // For photographer invoices  
  photographer_id?: string;
  period_start?: string;
  period_end?: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const request = await req.json() as GenerateInvoiceRequest;

    if (request.type === 'customer') {
      return await generateCustomerInvoice(supabase, request);
    } else {
      return await generatePhotographerInvoice(supabase, request);
    }
  } catch (error) {
    console.error('Generate Invoice Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateCustomerInvoice(supabase: any, request: GenerateInvoiceRequest) {
  const { customer_id, order_ids } = request;

  if (!customer_id || !order_ids?.length) {
    throw new Error('customer_id and order_ids are required');
  }

  // Get customer details
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*, company:companies(*)')
    .eq('id', customer_id)
    .single();

  if (customerError || !customer) {
    throw new Error(`Customer not found: ${customer_id}`);
  }

  // Get orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .in('id', order_ids)
    .eq('customer_id', customer_id);

  if (ordersError || !orders?.length) {
    throw new Error('No orders found');
  }

  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from('customer_invoices')
    .select('invoice_number')
    .eq('company_id', customer.company_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const lastNumber = lastInvoice?.invoice_number 
    ? parseInt(lastInvoice.invoice_number.replace(/\D/g, '')) 
    : 0;
  const invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;

  // Calculate totals
  let subtotal = 0;
  let taxAmount = 0;
  const lineItems: any[] = [];

  for (const order of orders) {
    for (const item of order.order_items || []) {
      subtotal += parseFloat(item.total_price);
      lineItems.push({
        order_id: order.id,
        order_item_id: item.id,
        description: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        tax_amount: 0, // Calculate based on tax rules
        total: item.total_price,
      });
    }

    // Add rush fee if applicable
    if (order.rush_fee_amount > 0) {
      subtotal += parseFloat(order.rush_fee_amount);
      lineItems.push({
        order_id: order.id,
        description: 'Rush Fee',
        quantity: 1,
        unit_price: order.rush_fee_amount,
        total: order.rush_fee_amount,
      });
    }

    // Add travel fee if applicable
    if (order.travel_fee > 0) {
      subtotal += parseFloat(order.travel_fee);
      lineItems.push({
        order_id: order.id,
        description: 'Travel Fee',
        quantity: 1,
        unit_price: order.travel_fee,
        total: order.travel_fee,
      });
    }
  }

  const total = subtotal + taxAmount;

  // Calculate due date based on payment terms
  const paymentTerms = customer.payment_terms || 0;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + paymentTerms);

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('customer_invoices')
    .insert({
      company_id: customer.company_id,
      customer_id,
      invoice_number: invoiceNumber,
      order_ids,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      subtotal,
      tax_amount: taxAmount,
      total,
      status: 'pending',
      payment_terms: paymentTerms,
    })
    .select()
    .single();

  if (invoiceError) {
    throw new Error(`Failed to create invoice: ${invoiceError.message}`);
  }

  // Create line items
  const { error: itemsError } = await supabase
    .from('customer_invoice_items')
    .insert(lineItems.map(item => ({
      invoice_id: invoice.id,
      ...item,
    })));

  if (itemsError) {
    console.error('Failed to create invoice items:', itemsError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      total,
      due_date: dueDate.toISOString().split('T')[0],
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function generatePhotographerInvoice(supabase: any, request: GenerateInvoiceRequest) {
  const { photographer_id, period_start, period_end } = request;

  if (!photographer_id || !period_start || !period_end) {
    throw new Error('photographer_id, period_start, and period_end are required');
  }

  // Get photographer details
  const { data: photographer, error: photoError } = await supabase
    .from('photographers')
    .select('*, user:users(*), company:companies(*)')
    .eq('id', photographer_id)
    .single();

  if (photoError || !photographer) {
    throw new Error(`Photographer not found: ${photographer_id}`);
  }

  // Get completed appointments in period
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      order:orders(
        *,
        order_items(*)
      )
    `)
    .eq('photographer_id', photographer_id)
    .eq('status', 'completed')
    .gte('scheduled_date', period_start)
    .lte('scheduled_date', period_end);

  // Get mileage logs
  const { data: mileageLogs } = await supabase
    .from('mileage_logs')
    .select('*')
    .eq('photographer_id', photographer_id)
    .gte('log_date', period_start)
    .lte('log_date', period_end)
    .eq('status', 'approved');

  // Get bonuses
  const { data: bonuses } = await supabase
    .from('bonuses')
    .select('*')
    .eq('photographer_id', photographer_id)
    .eq('status', 'approved')
    .gte('earned_date', period_start)
    .lte('earned_date', period_end);

  // Get commissions
  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('user_id', photographer.user_id)
    .eq('status', 'approved')
    .gte('earned_date', period_start)
    .lte('earned_date', period_end);

  // Calculate earnings
  let jobEarnings = 0;
  let mileageEarnings = 0;
  let bonusEarnings = 0;
  let commissionEarnings = 0;
  const lineItems: any[] = [];

  // Job earnings
  for (const appointment of appointments || []) {
    const payout = appointment.order?.order_items?.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.photographer_payout) || 0);
    }, 0) || 0;

    if (payout > 0) {
      jobEarnings += payout;
      lineItems.push({
        appointment_id: appointment.id,
        order_id: appointment.order_id,
        item_type: 'job',
        description: `Order ${appointment.order?.order_number}`,
        service_date: appointment.scheduled_date,
        amount: payout,
      });
    }
  }

  // Mileage
  for (const log of mileageLogs || []) {
    mileageEarnings += parseFloat(log.reimbursement_amount);
    lineItems.push({
      item_type: 'mileage',
      description: `Mileage: ${log.start_address} to ${log.end_address}`,
      quantity: log.distance_miles,
      rate: log.rate_per_mile,
      service_date: log.log_date,
      amount: log.reimbursement_amount,
    });
  }

  // Bonuses
  for (const bonus of bonuses || []) {
    bonusEarnings += parseFloat(bonus.amount);
    lineItems.push({
      item_type: 'bonus',
      description: bonus.name,
      service_date: bonus.earned_date,
      amount: bonus.amount,
    });
  }

  // Commissions
  for (const commission of commissions || []) {
    commissionEarnings += parseFloat(commission.commission_amount);
    lineItems.push({
      order_id: commission.order_id,
      item_type: 'incentive',
      description: 'Sales Commission',
      service_date: commission.earned_date,
      amount: commission.commission_amount,
    });
  }

  const grossTotal = jobEarnings + mileageEarnings + bonusEarnings + commissionEarnings;
  const netTotal = grossTotal; // Add deductions logic if needed

  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from('photographer_invoices')
    .select('invoice_number')
    .eq('company_id', photographer.company_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const lastNumber = lastInvoice?.invoice_number 
    ? parseInt(lastInvoice.invoice_number.replace(/\D/g, '')) 
    : 0;
  const invoiceNumber = `PAY-${String(lastNumber + 1).padStart(6, '0')}`;

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('photographer_invoices')
    .insert({
      company_id: photographer.company_id,
      photographer_id,
      invoice_number: invoiceNumber,
      period_start,
      period_end,
      job_earnings: jobEarnings,
      mileage_earnings: mileageEarnings,
      bonus_earnings: bonusEarnings,
      incentive_earnings: commissionEarnings,
      gross_total: grossTotal,
      net_total: netTotal,
      status: 'pending',
    })
    .select()
    .single();

  if (invoiceError) {
    throw new Error(`Failed to create invoice: ${invoiceError.message}`);
  }

  // Create line items
  if (lineItems.length > 0) {
    await supabase
      .from('photographer_invoice_items')
      .insert(lineItems.map(item => ({
        invoice_id: invoice.id,
        ...item,
      })));
  }

  return new Response(
    JSON.stringify({
      success: true,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      period: { start: period_start, end: period_end },
      earnings: {
        jobs: jobEarnings,
        mileage: mileageEarnings,
        bonuses: bonusEarnings,
        commissions: commissionEarnings,
      },
      gross_total: grossTotal,
      net_total: netTotal,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
