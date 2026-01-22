import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { openai, MODELS } from '../_shared/openai.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Daily Schedule Optimizer
 * 
 * Runs at 5:30 PM in each market's timezone to optimize the next day's schedule.
 * 
 * This function:
 * 1. Groups appointments by market
 * 2. Optimizes routes for each photographer
 * 3. Suggests reassignments for better efficiency
 * 4. Identifies capacity gaps and overbooking risks
 */

interface MarketSchedule {
  market_id: string;
  market_name: string;
  timezone: string;
  appointments: any[];
  photographers: any[];
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const { target_date, company_id } = await req.json();

    // Calculate tomorrow's date if not provided
    const optimizeDate = target_date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Get all active markets for the company
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('*')
      .eq('company_id', company_id)
      .eq('is_active', true);

    if (marketsError || !markets?.length) {
      throw new Error('No active markets found');
    }

    const optimizationResults = [];

    for (const market of markets) {
      // Get all appointments for this market on the target date
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          order:orders(
            *,
            property:properties(*),
            customer:customers(*)
          ),
          photographer:photographers(
            *,
            user:users(*)
          )
        `)
        .eq('company_id', company_id)
        .eq('scheduled_date', optimizeDate)
        .not('status', 'in', '(cancelled,rescheduled)')
        .order('scheduled_start_time');

      // Get available photographers for this market
      const { data: photographers } = await supabase
        .from('photographers')
        .select(`
          *,
          user:users(*),
          photographer_markets!inner(market_id)
        `)
        .eq('photographer_markets.market_id', market.id)
        .eq('is_active', true)
        .eq('is_available', true);

      if (!appointments?.length || !photographers?.length) {
        continue;
      }

      // Build schedule data for AI optimization
      const scheduleData = {
        market: {
          id: market.id,
          name: market.name,
          timezone: market.timezone,
        },
        date: optimizeDate,
        appointments: appointments.map(a => ({
          id: a.id,
          order_number: a.order?.order_number,
          scheduled_start: a.scheduled_start_time,
          scheduled_end: a.scheduled_end_time,
          estimated_duration: a.estimated_duration_minutes,
          location: {
            lat: a.order?.property?.lat,
            lng: a.order?.property?.lng,
            address: a.order?.property?.formatted_address,
          },
          assigned_photographer_id: a.photographer_id,
          required_skills: a.order?.order_items?.map((i: any) => i.required_skills).flat() || [],
          customer_preference: a.order?.customer?.preferred_photographers,
          is_rush: a.order?.is_rush,
        })),
        photographers: photographers.map(p => ({
          id: p.id,
          name: `${p.user?.first_name} ${p.user?.last_name}`,
          home_location: {
            lat: p.home_lat,
            lng: p.home_lng,
          },
          skills: p.skills,
          max_daily_jobs: p.max_daily_jobs,
          current_assignments: appointments.filter(a => a.photographer_id === p.id).length,
        })),
      };

      // AI optimization
      const response = await openai.chat.completions.create({
        model: MODELS.GPT4_TURBO,
        messages: [
          {
            role: 'system',
            content: `You are a logistics optimization expert. Analyze the day's photography schedule and suggest optimizations.

Focus on:
1. Route efficiency - minimize travel time between jobs
2. Workload balance - distribute jobs fairly
3. Time conflicts - identify scheduling issues
4. Buffer time - ensure adequate breaks
5. Geographic clustering - group nearby jobs

Return JSON with:
- optimized_schedule: Array of appointment reassignments
- efficiency_score: 0-100 rating of current schedule
- potential_improvements: Array of specific suggestions
- conflicts: Array of identified issues
- estimated_savings: Time/miles saved with optimizations`,
          },
          {
            role: 'user',
            content: JSON.stringify(scheduleData),
          },
        ],
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const optimization = JSON.parse(response.choices[0]?.message?.content || '{}');

      // Store optimization results
      await supabase.from('ai_recommendations').insert({
        company_id,
        target_type: 'schedule',
        target_id: market.id,
        recommendation_type: 'schedule_optimization',
        title: `Daily Schedule Optimization: ${market.name} - ${optimizeDate}`,
        description: `Analyzed ${appointments.length} appointments across ${photographers.length} photographers`,
        confidence_score: 0.85,
        estimated_impact: {
          efficiency_score: optimization.efficiency_score,
          estimated_savings: optimization.estimated_savings,
        },
        supporting_data: {
          market_id: market.id,
          date: optimizeDate,
          appointments_count: appointments.length,
          photographers_count: photographers.length,
          optimized_schedule: optimization.optimized_schedule,
          potential_improvements: optimization.potential_improvements,
          conflicts: optimization.conflicts,
        },
        status: 'pending',
      });

      // Create AI flags for any critical conflicts
      for (const conflict of optimization.conflicts || []) {
        if (conflict.severity === 'critical' || conflict.severity === 'high') {
          await supabase.from('ai_flags').insert({
            company_id,
            entity_type: 'appointment',
            entity_id: conflict.appointment_id,
            flag_type: 'schedule_conflict',
            severity: conflict.severity === 'critical' ? 'error' : 'warning',
            title: conflict.title,
            description: conflict.description,
            ai_model: MODELS.GPT4_TURBO,
            ai_confidence: 0.9,
            recommendations: [conflict.suggested_action],
            status: 'active',
          });
        }
      }

      optimizationResults.push({
        market_id: market.id,
        market_name: market.name,
        appointments_analyzed: appointments.length,
        efficiency_score: optimization.efficiency_score,
        conflicts_found: optimization.conflicts?.length || 0,
        improvements_suggested: optimization.potential_improvements?.length || 0,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: optimizeDate,
        markets_processed: optimizationResults.length,
        results: optimizationResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Daily Schedule Optimizer Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
