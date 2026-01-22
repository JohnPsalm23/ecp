import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { openai, MODELS, SCHEDULING_SYSTEM_PROMPT } from '../_shared/openai.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface ScheduleOptimizeRequest {
  order_id: string;
  preferred_date: string;
  preferred_time_start: string;
  preferred_time_end: string;
  required_skills: string[];
  market_id: string;
}

interface PhotographerCandidate {
  id: string;
  user_id: string;
  name: string;
  home_lat: number;
  home_lng: number;
  skills: string[];
  average_rating: number;
  qc_pass_rate: number;
  max_daily_jobs: number;
  current_jobs_count: number;
  availability_blocks: any[];
  existing_appointments: any[];
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const request = await req.json() as ScheduleOptimizeRequest;

    // Get order and property details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        property:properties(*)
      `)
      .eq('id', request.order_id)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${request.order_id}`);
    }

    // Get market details for timezone
    const { data: market } = await supabase
      .from('markets')
      .select('*')
      .eq('id', request.market_id)
      .single();

    // Get available photographers for this market with skills match
    const { data: photographers, error: photoError } = await supabase
      .from('photographers')
      .select(`
        *,
        user:users(first_name, last_name, email),
        photographer_markets!inner(market_id)
      `)
      .eq('photographer_markets.market_id', request.market_id)
      .eq('is_active', true)
      .eq('is_available', true)
      .contains('skills', request.required_skills);

    if (photoError || !photographers?.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No available photographers with required skills',
          recommendations: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get availability blocks for the requested date
    const { data: availabilityBlocks } = await supabase
      .from('availability_blocks')
      .select('*')
      .in('photographer_id', photographers.map(p => p.id))
      .gte('start_time', `${request.preferred_date}T00:00:00`)
      .lte('end_time', `${request.preferred_date}T23:59:59`);

    // Get existing appointments for the requested date
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .in('photographer_id', photographers.map(p => p.id))
      .eq('scheduled_date', request.preferred_date)
      .not('status', 'in', '(cancelled,rescheduled)');

    // Build candidate profiles for AI analysis
    const candidates: PhotographerCandidate[] = photographers.map(p => ({
      id: p.id,
      user_id: p.user_id,
      name: `${p.user?.first_name} ${p.user?.last_name}`,
      home_lat: p.home_lat,
      home_lng: p.home_lng,
      skills: p.skills || [],
      average_rating: p.average_rating || 0,
      qc_pass_rate: p.qc_pass_rate || 100,
      max_daily_jobs: p.max_daily_jobs || 8,
      current_jobs_count: existingAppointments?.filter(a => a.photographer_id === p.id).length || 0,
      availability_blocks: availabilityBlocks?.filter(b => b.photographer_id === p.id) || [],
      existing_appointments: existingAppointments?.filter(a => a.photographer_id === p.id) || [],
    }));

    // Use AI to rank and recommend photographers
    const response = await openai.chat.completions.create({
      model: MODELS.GPT4_TURBO,
      messages: [
        {
          role: 'system',
          content: SCHEDULING_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: JSON.stringify({
            job_requirements: {
              order_id: request.order_id,
              preferred_date: request.preferred_date,
              preferred_time_start: request.preferred_time_start,
              preferred_time_end: request.preferred_time_end,
              required_skills: request.required_skills,
              property_location: {
                lat: order.property?.lat,
                lng: order.property?.lng,
                address: order.property?.formatted_address,
              },
              market_timezone: market?.timezone,
            },
            available_photographers: candidates.map(c => ({
              id: c.id,
              name: c.name,
              home_location: { lat: c.home_lat, lng: c.home_lng },
              skills: c.skills,
              rating: c.average_rating,
              qc_pass_rate: c.qc_pass_rate,
              capacity: {
                max_daily: c.max_daily_jobs,
                current_count: c.current_jobs_count,
              },
              unavailable_blocks: c.availability_blocks
                .filter(b => b.availability_type === 'unavailable')
                .map(b => ({ start: b.start_time, end: b.end_time })),
              existing_appointments: c.existing_appointments.map(a => ({
                start: `${a.scheduled_date}T${a.scheduled_start_time}`,
                end: `${a.scheduled_date}T${a.scheduled_end_time}`,
                location_lat: null, // Would need property join
                location_lng: null,
              })),
            })),
          }),
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const aiRecommendations = JSON.parse(response.choices[0]?.message?.content || '{}');

    // Store AI recommendation
    await supabase.from('ai_recommendations').insert({
      company_id: order.company_id,
      target_type: 'schedule',
      target_id: request.order_id,
      recommendation_type: 'schedule_optimization',
      title: `Photographer Assignment for Order ${order.order_number}`,
      description: aiRecommendations.summary || 'AI-generated scheduling recommendation',
      confidence_score: aiRecommendations.confidence || 0.8,
      supporting_data: {
        candidates_analyzed: candidates.length,
        recommendations: aiRecommendations.recommendations,
      },
      status: 'pending',
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: request.order_id,
        recommendations: aiRecommendations.recommendations || [],
        summary: aiRecommendations.summary,
        candidates_analyzed: candidates.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Schedule Optimization Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
