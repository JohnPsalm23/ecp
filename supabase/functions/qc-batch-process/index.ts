import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface BatchProcessRequest {
  order_id: string;
  upload_job_id?: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const { order_id, upload_job_id } = await req.json() as BatchProcessRequest;

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, company_id, order_number')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${order_id}`);
    }

    // Create QC job
    const { data: qcJob, error: qcJobError } = await supabase
      .from('qc_jobs')
      .insert({
        company_id: order.company_id,
        order_id,
        upload_job_id,
        job_type: 'auto',
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (qcJobError || !qcJob) {
      throw new Error(`Failed to create QC job: ${qcJobError?.message}`);
    }

    // Get all unprocessed media assets for this order
    const { data: assets, error: assetsError } = await supabase
      .from('media_assets')
      .select('id, media_type')
      .eq('order_id', order_id)
      .eq('qc_status', 'pending')
      .in('media_type', ['photo', 'drone_photo', 'twilight'])
      .is('is_deleted', false);

    if (assetsError) {
      throw new Error(`Failed to fetch media assets: ${assetsError.message}`);
    }

    // Update QC job with total count
    await supabase
      .from('qc_jobs')
      .update({ total_assets: assets?.length || 0 })
      .eq('id', qcJob.id);

    // Process each asset by invoking qc-analyze function
    const results = {
      total: assets?.length || 0,
      passed: 0,
      warning: 0,
      failed: 0,
      errors: [] as string[],
    };

    const baseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    for (const asset of assets || []) {
      try {
        const response = await fetch(`${baseUrl}/functions/v1/qc-analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            media_asset_id: asset.id,
            order_id,
            qc_job_id: qcJob.id,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          if (result.qc_status === 'passed') results.passed++;
          else if (result.qc_status === 'warning') results.warning++;
          else if (result.qc_status === 'failed') results.failed++;
        } else {
          results.errors.push(`Asset ${asset.id}: ${result.error}`);
        }
      } catch (error) {
        results.errors.push(`Asset ${asset.id}: ${error.message}`);
      }
    }

    // Determine overall QC job status
    let overallStatus: 'passed' | 'warning' | 'failed';
    if (results.failed > 0) {
      overallStatus = 'failed';
    } else if (results.warning > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'passed';
    }

    // Calculate overall score
    const overallScore = results.total > 0
      ? Math.round(((results.passed * 100) + (results.warning * 70) + (results.failed * 30)) / results.total)
      : 0;

    // Update QC job with final results
    await supabase
      .from('qc_jobs')
      .update({
        status: overallStatus,
        overall_score: overallScore,
        passed_assets: results.passed,
        warning_assets: results.warning,
        failed_assets: results.failed,
        completed_at: new Date().toISOString(),
        ai_processed: true,
        ai_processed_at: new Date().toISOString(),
        ai_model_version: 'gpt-4-vision-preview',
        summary: {
          total_processed: results.total,
          errors: results.errors,
        },
      })
      .eq('id', qcJob.id);

    // Update order status based on QC results
    if (overallStatus === 'passed') {
      await supabase
        .from('orders')
        .update({ status: 'qc_passed' })
        .eq('id', order_id);
    } else if (overallStatus === 'failed') {
      await supabase
        .from('orders')
        .update({ status: 'qc_failed' })
        .eq('id', order_id);
    }

    // Create summary notification
    await supabase.from('ai_flags').insert({
      company_id: order.company_id,
      entity_type: 'order',
      entity_id: order_id,
      flag_type: 'qc_issue',
      severity: overallStatus === 'passed' ? 'info' : overallStatus === 'warning' ? 'warning' : 'error',
      title: `QC Complete: Order ${order.order_number}`,
      description: `QC completed with score ${overallScore}/100. ${results.passed} passed, ${results.warning} warnings, ${results.failed} failed.`,
      ai_model: 'gpt-4-vision-preview',
      ai_confidence: 0.9,
      status: 'active',
    });

    return new Response(
      JSON.stringify({
        success: true,
        qc_job_id: qcJob.id,
        status: overallStatus,
        overall_score: overallScore,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Batch QC Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
