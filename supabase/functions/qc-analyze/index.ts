import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { analyzeImageForQC, QCAnalysisResult } from '../_shared/openai.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

interface QCAnalyzeRequest {
  media_asset_id: string;
  order_id: string;
  qc_job_id?: string;
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const { media_asset_id, order_id, qc_job_id } = await req.json() as QCAnalyzeRequest;

    // Get media asset
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', media_asset_id)
      .single();

    if (assetError || !asset) {
      throw new Error(`Media asset not found: ${media_asset_id}`);
    }

    // Get signed URL for the image
    const { data: urlData, error: urlError } = await supabase.storage
      .from(asset.storage_bucket)
      .createSignedUrl(asset.storage_path, 3600);

    if (urlError || !urlData) {
      throw new Error('Failed to generate signed URL');
    }

    console.log(`Analyzing image: ${asset.filename}`);

    // Run AI analysis
    const startTime = Date.now();
    const analysis: QCAnalysisResult = await analyzeImageForQC(urlData.signedUrl);
    const processingTime = Date.now() - startTime;

    // Determine QC status based on score
    let qcStatus: 'passed' | 'warning' | 'failed';
    if (analysis.overall_score >= 80) {
      qcStatus = 'passed';
    } else if (analysis.overall_score >= 60) {
      qcStatus = 'warning';
    } else {
      qcStatus = 'failed';
    }

    // Update media asset with QC results
    const { error: updateError } = await supabase
      .from('media_assets')
      .update({
        qc_status: qcStatus,
        qc_score: analysis.overall_score,
        qc_issues: analysis.issues,
        ai_analysis: analysis,
        ai_tags: [analysis.room_type].filter(Boolean),
        ai_description: analysis.scene_description,
        room_type: analysis.room_type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', media_asset_id);

    if (updateError) {
      throw new Error(`Failed to update media asset: ${updateError.message}`);
    }

    // Create QC result record if qc_job_id provided
    if (qc_job_id) {
      const { error: resultError } = await supabase
        .from('qc_results')
        .insert({
          qc_job_id,
          media_asset_id,
          status: qcStatus,
          overall_score: analysis.overall_score,
          exposure_score: analysis.scores.exposure,
          white_balance_score: analysis.scores.white_balance,
          sharpness_score: analysis.scores.sharpness,
          composition_score: analysis.scores.composition,
          color_accuracy_score: analysis.scores.color_accuracy,
          noise_score: analysis.scores.noise,
          ai_analysis: analysis,
          ai_confidence: 0.85,
          processed_at: new Date().toISOString(),
          processing_time_ms: processingTime,
        });

      if (resultError) {
        console.error('Failed to create QC result:', resultError);
      }

      // Create QC issues
      if (analysis.issues.length > 0) {
        const { data: qcResult } = await supabase
          .from('qc_results')
          .select('id')
          .eq('qc_job_id', qc_job_id)
          .eq('media_asset_id', media_asset_id)
          .single();

        if (qcResult) {
          const issueRecords = analysis.issues.map(issue => ({
            qc_result_id: qcResult.id,
            media_asset_id,
            issue_type: issue.type,
            severity: issue.severity,
            description: issue.description,
            location_x: issue.location?.x,
            location_y: issue.location?.y,
            ai_detected: true,
            ai_confidence: issue.confidence,
          }));

          await supabase.from('qc_issues').insert(issueRecords);
        }
      }
    }

    // If QC failed, notify photographer
    if (qcStatus === 'failed') {
      // Get appointment and photographer info
      const { data: appointment } = await supabase
        .from('appointments')
        .select('photographer_id, photographers(user_id, users(email, phone))')
        .eq('order_id', order_id)
        .single();

      if (appointment?.photographers) {
        // Create notification task
        await supabase.from('tasks').insert({
          company_id: asset.company_id,
          title: `QC Failed: Review required for order`,
          description: `Image ${asset.filename} failed QC with score ${analysis.overall_score}. Issues: ${analysis.issues.map(i => i.description).join(', ')}`,
          priority: 'high',
          status: 'pending',
          order_id,
          assigned_to: appointment.photographers.user_id,
        });

        // Create AI flag
        await supabase.from('ai_flags').insert({
          company_id: asset.company_id,
          entity_type: 'media_asset',
          entity_id: media_asset_id,
          flag_type: 'qc_issue',
          severity: 'error',
          title: `QC Failed: ${asset.filename}`,
          description: `Image failed quality control with score ${analysis.overall_score}/100`,
          ai_model: 'gpt-4-vision-preview',
          ai_confidence: 0.85,
          recommendations: analysis.recommendations,
          status: 'active',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        media_asset_id,
        qc_status: qcStatus,
        score: analysis.overall_score,
        issues_count: analysis.issues.length,
        processing_time_ms: processingTime,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('QC Analysis Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
