import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * HubSpot Sync Function
 * 
 * Synchronizes customers, orders, and activities with HubSpot CRM.
 */

interface HubSpotSyncRequest {
  action: 'sync_customer' | 'sync_order' | 'log_activity' | 'sync_all';
  customer_id?: string;
  order_id?: string;
  activity?: {
    type: 'call' | 'email' | 'meeting' | 'task' | 'note';
    subject: string;
    body?: string;
  };
}

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

async function hubspotRequest(endpoint: string, method: string, body?: any) {
  const apiKey = Deno.env.get('HUBSPOT_API_KEY');
  
  const response = await fetch(`${HUBSPOT_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API error: ${error}`);
  }

  return response.json();
}

async function syncCustomer(supabase: any, customerId: string) {
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error || !customer) {
    throw new Error('Customer not found');
  }

  const contactData = {
    properties: {
      email: customer.email,
      firstname: customer.first_name,
      lastname: customer.last_name,
      phone: customer.phone,
      company: customer.business_name,
      address: customer.address_line1,
      city: customer.city,
      state: customer.state,
      zip: customer.postal_code,
      // Custom properties
      lifetime_orders: customer.lifetime_orders?.toString(),
      lifetime_revenue: customer.lifetime_revenue?.toString(),
      is_vip: customer.is_vip ? 'true' : 'false',
      ecp_customer_id: customer.id,
    },
  };

  let hubspotContactId = customer.hubspot_contact_id;

  if (hubspotContactId) {
    // Update existing contact
    await hubspotRequest(
      `/crm/v3/objects/contacts/${hubspotContactId}`,
      'PATCH',
      contactData
    );
  } else {
    // Create new contact
    const result = await hubspotRequest(
      '/crm/v3/objects/contacts',
      'POST',
      contactData
    );
    hubspotContactId = result.id;

    // Store HubSpot ID
    await supabase
      .from('customers')
      .update({ hubspot_contact_id: hubspotContactId })
      .eq('id', customerId);
  }

  return { hubspotContactId };
}

async function syncOrder(supabase: any, orderId: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(hubspot_contact_id),
      order_items(product_name, quantity, total_price)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    throw new Error('Order not found');
  }

  if (!order.customer?.hubspot_contact_id) {
    throw new Error('Customer not synced to HubSpot');
  }

  // Create deal in HubSpot
  const dealData = {
    properties: {
      dealname: `Order ${order.order_number}`,
      amount: order.total?.toString(),
      dealstage: mapOrderStatusToDealStage(order.status),
      pipeline: 'default',
      closedate: order.actual_delivery_at || order.expected_delivery_at,
      ecp_order_id: order.id,
      order_number: order.order_number,
      products: order.order_items?.map((i: any) => i.product_name).join(', '),
    },
  };

  let dealId;

  // Check if deal already exists (by order number)
  try {
    const searchResult = await hubspotRequest(
      `/crm/v3/objects/deals/search`,
      'POST',
      {
        filterGroups: [{
          filters: [{
            propertyName: 'order_number',
            operator: 'EQ',
            value: order.order_number,
          }],
        }],
      }
    );

    if (searchResult.results?.length > 0) {
      dealId = searchResult.results[0].id;
      await hubspotRequest(`/crm/v3/objects/deals/${dealId}`, 'PATCH', dealData);
    }
  } catch (e) {
    // Deal doesn't exist, create new
  }

  if (!dealId) {
    const result = await hubspotRequest('/crm/v3/objects/deals', 'POST', dealData);
    dealId = result.id;

    // Associate deal with contact
    await hubspotRequest(
      `/crm/v4/objects/deals/${dealId}/associations/contacts/${order.customer.hubspot_contact_id}`,
      'PUT',
      [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
    );
  }

  return { dealId };
}

async function logActivity(supabase: any, customerId: string, activity: any) {
  const { data: customer } = await supabase
    .from('customers')
    .select('hubspot_contact_id')
    .eq('id', customerId)
    .single();

  if (!customer?.hubspot_contact_id) {
    throw new Error('Customer not synced to HubSpot');
  }

  const engagementType = {
    call: 'CALL',
    email: 'EMAIL',
    meeting: 'MEETING',
    task: 'TASK',
    note: 'NOTE',
  }[activity.type] || 'NOTE';

  const engagementData = {
    properties: {
      hs_timestamp: new Date().toISOString(),
      hs_activity_type: engagementType,
      hs_note_body: activity.body || activity.subject,
    },
  };

  const objectType = engagementType === 'NOTE' ? 'notes' : engagementType.toLowerCase() + 's';
  
  const result = await hubspotRequest(
    `/crm/v3/objects/${objectType}`,
    'POST',
    engagementData
  );

  // Associate with contact
  await hubspotRequest(
    `/crm/v4/objects/${objectType}/${result.id}/associations/contacts/${customer.hubspot_contact_id}`,
    'PUT',
    [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 }]
  );

  return { engagementId: result.id };
}

function mapOrderStatusToDealStage(status: string): string {
  const stageMap: Record<string, string> = {
    draft: 'appointmentscheduled',
    pending_payment: 'qualifiedtobuy',
    confirmed: 'presentationscheduled',
    scheduled: 'presentationscheduled',
    en_route: 'presentationscheduled',
    started: 'presentationscheduled',
    completed: 'decisionmakerboughtin',
    uploading: 'decisionmakerboughtin',
    editing: 'decisionmakerboughtin',
    qc_pending: 'decisionmakerboughtin',
    qc_passed: 'contractsent',
    delivered: 'closedwon',
    cancelled: 'closedlost',
  };
  return stageMap[status] || 'appointmentscheduled';
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const request = await req.json() as HubSpotSyncRequest;

    let result: any;

    switch (request.action) {
      case 'sync_customer':
        if (!request.customer_id) throw new Error('customer_id required');
        result = await syncCustomer(supabase, request.customer_id);
        break;

      case 'sync_order':
        if (!request.order_id) throw new Error('order_id required');
        result = await syncOrder(supabase, request.order_id);
        break;

      case 'log_activity':
        if (!request.customer_id || !request.activity) {
          throw new Error('customer_id and activity required');
        }
        result = await logActivity(supabase, request.customer_id, request.activity);
        break;

      default:
        throw new Error('Unknown action');
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('HubSpot Sync Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
