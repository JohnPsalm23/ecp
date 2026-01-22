import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
type OrderStatus = Database['public']['Enums']['order_status'];

const createOrderSchema = z.object({
  customer_id: z.string().uuid(),
  market_id: z.string().uuid(),
  property: z.object({
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  products: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })),
  preferred_date: z.string().optional(),
  preferred_time_start: z.string().optional(),
  preferred_time_end: z.string().optional(),
  is_flexible_time: z.boolean().default(false),
  is_rush: z.boolean().default(false),
  customer_notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  const market_id = searchParams.get('market_id');
  const customer_id = searchParams.get('customer_id');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('orders')
    .select(`
      *,
      customer:customers(id, first_name, last_name, email, phone),
      property:properties(id, formatted_address, city, state),
      market:markets(id, name, timezone),
      order_items(
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      ),
      appointments(
        id,
        scheduled_date,
        scheduled_start_time,
        status,
        photographer:photographers(
          id,
          user:users(first_name, last_name)
        )
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status as OrderStatus);
  }
  if (market_id) {
    query = query.eq('market_id', market_id);
  }
  if (customer_id) {
    query = query.eq('customer_id', customer_id);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: data,
    pagination: {
      total: count,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    },
  });
}

export async function POST(request: NextRequest) {
  const authClient = await createServerSupabaseClient();
  const supabase = createAdminClient();
  
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Get user session
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company
    const { data: userProfile } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.company_id) {
      return NextResponse.json({ error: 'User has no company' }, { status: 400 });
    }

    // Create property
    const propertyInsert: PropertyInsert = {
      company_id: userProfile.company_id,
      customer_id: validatedData.customer_id,
      address_line1: validatedData.property.address_line1,
      address_line2: validatedData.property.address_line2,
      city: validatedData.property.city,
      state: validatedData.property.state,
      postal_code: validatedData.property.postal_code,
      lat: validatedData.property.lat,
      lng: validatedData.property.lng,
      formatted_address: `${validatedData.property.address_line1}, ${validatedData.property.city}, ${validatedData.property.state} ${validatedData.property.postal_code}`,
      market_id: validatedData.market_id,
    };

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert(propertyInsert)
      .select()
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: propertyError?.message || 'Failed to create property' }, { status: 500 });
    }

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const order_number = `ORD-${timestamp}${random}`;

    // Get products for pricing
    const { data: products } = await supabase
      .from('products')
      .select('id, base_price, estimated_duration_minutes')
      .in('id', validatedData.products.map(p => p.product_id));

    const productList = products || [];
    const productMap = new Map(productList.map(p => [p.id, p]));

    // Calculate totals
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      estimated_duration_minutes: number | null;
    }> = [];

    for (const item of validatedData.products) {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error(`Product not found: ${item.product_id}`);
      
      const itemTotal = (product.base_price || 0) * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.base_price || 0,
        total_price: itemTotal,
        estimated_duration_minutes: product.estimated_duration_minutes,
      });
    }

    // Create order
    const orderInsert: OrderInsert = {
      company_id: userProfile.company_id,
      market_id: validatedData.market_id,
      order_number,
      customer_id: validatedData.customer_id,
      property_id: property.id,
      status: 'draft',
      preferred_date: validatedData.preferred_date,
      preferred_time_start: validatedData.preferred_time_start,
      preferred_time_end: validatedData.preferred_time_end,
      is_flexible_time: validatedData.is_flexible_time,
      is_rush: validatedData.is_rush,
      subtotal,
      total: subtotal,
      customer_notes: validatedData.customer_notes,
      created_by: user.id,
      source: 'api',
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItemsInsert: OrderItemInsert[] = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      product_name: 'Product',
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsInsert);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
