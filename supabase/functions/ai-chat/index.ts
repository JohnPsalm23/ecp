import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { openai, MODELS } from '../_shared/openai.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * AI Chat Function
 * 
 * Context-aware AI assistant for customers, photographers, and admins.
 * Uses conversation history, order context, and knowledge base.
 */

interface ChatRequest {
  message: string;
  conversation_id?: string;
  context?: {
    order_id?: string;
    customer_id?: string;
    photographer_id?: string;
    user_role?: string;
  };
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const { message, conversation_id, context } = await req.json() as ChatRequest;

    // Build system prompt based on user role
    let systemPrompt = `You are an AI assistant for the ECP Real Estate Media Platform. You help with:
- Booking and scheduling photo/video shoots
- Order status inquiries
- Quality control questions
- Photographer availability
- Pricing and product information
- Account and billing questions

Always be helpful, professional, and concise.`;

    // Add role-specific context
    if (context?.user_role === 'customer') {
      systemPrompt += `\n\nYou are speaking with a customer. Focus on helping them with their orders, scheduling, and deliverables.`;
    } else if (context?.user_role === 'photographer') {
      systemPrompt += `\n\nYou are speaking with a photographer. Help with schedule management, equipment, QC feedback, and payroll questions.`;
    } else if (context?.user_role === 'admin' || context?.user_role === 'company_admin') {
      systemPrompt += `\n\nYou are speaking with an admin. You can provide analytics, operational insights, and help with system management.`;
    }

    // Fetch relevant context from database
    const contextData: any = {};

    if (context?.order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(first_name, last_name, email),
          property:properties(formatted_address),
          appointments(scheduled_date, scheduled_start_time, status)
        `)
        .eq('id', context.order_id)
        .single();

      if (order) {
        contextData.order = order;
        systemPrompt += `\n\nCurrent order context:
- Order #: ${order.order_number}
- Status: ${order.status}
- Property: ${order.property?.formatted_address}
- Customer: ${order.customer?.first_name} ${order.customer?.last_name}`;

        if (order.appointments?.[0]) {
          systemPrompt += `
- Scheduled: ${order.appointments[0].scheduled_date} at ${order.appointments[0].scheduled_start_time}`;
        }
      }
    }

    if (context?.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('first_name, last_name, lifetime_orders, lifetime_revenue')
        .eq('id', context.customer_id)
        .single();

      if (customer) {
        contextData.customer = customer;
        systemPrompt += `\n\nCustomer info: ${customer.first_name} ${customer.last_name} (${customer.lifetime_orders} orders)`;
      }
    }

    // Get conversation history
    let conversationHistory: any[] = [];
    if (conversation_id) {
      const { data: messages } = await supabase
        .from('messages')
        .select('body, sender_type')
        .eq('thread_id', conversation_id)
        .order('created_at', { ascending: true })
        .limit(10);

      if (messages) {
        conversationHistory = messages.map(m => ({
          role: m.sender_type === 'ai' ? 'assistant' : 'user',
          content: m.body,
        }));
      }
    }

    // Get relevant notes for context
    if (context?.order_id) {
      const { data: notes } = await supabase
        .from('notes')
        .select('content')
        .eq('entity_type', 'order')
        .eq('entity_id', context.order_id)
        .eq('is_ai_readable', true)
        .limit(5);

      if (notes?.length) {
        systemPrompt += `\n\nRelevant notes:\n${notes.map(n => `- ${n.content}`).join('\n')}`;
      }
    }

    // Build messages for OpenAI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: MODELS.GPT4_TURBO,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    // Store conversation in database
    const threadId = conversation_id || crypto.randomUUID();

    // Store user message
    await supabase.from('messages').insert({
      company_id: contextData.order?.company_id || null,
      thread_id: threadId,
      sender_type: 'user',
      recipient_type: 'ai',
      channel: 'in_app',
      body: message,
      order_id: context?.order_id,
      is_ai_generated: false,
    });

    // Store AI response
    await supabase.from('messages').insert({
      company_id: contextData.order?.company_id || null,
      thread_id: threadId,
      sender_type: 'ai',
      recipient_type: 'user',
      channel: 'in_app',
      body: assistantMessage,
      order_id: context?.order_id,
      is_ai_generated: true,
      ai_context: {
        model: MODELS.GPT4_TURBO,
        context_provided: Object.keys(contextData),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
        conversation_id: threadId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
