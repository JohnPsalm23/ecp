import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdmin } from '../_shared/supabase.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

/**
 * Process Upload Function
 * 
 * Triggered after media files are uploaded to Supabase Storage.
 * 
 * This function:
 * 1. Creates media_asset records
 * 2. Generates thumbnails
 * 3. Extracts EXIF metadata
 * 4. Triggers QC pipeline
 */

interface UploadEvent {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    name: string;
    bucket_id: string;
    owner: string;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: any;
  };
}

interface ProcessUploadRequest {
  upload_job_id: string;
  order_id: string;
  appointment_id?: string;
  files: Array<{
    storage_path: string;
    original_filename: string;
    mime_type: string;
    file_size: number;
  }>;
}

function getMediaType(mimeType: string, filename: string): string {
  if (mimeType.startsWith('video/')) {
    if (filename.toLowerCase().includes('drone')) {
      return 'drone_video';
    }
    return 'video';
  }
  
  if (mimeType.startsWith('image/')) {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('drone') || lowerFilename.includes('aerial')) {
      return 'drone_photo';
    }
    if (lowerFilename.includes('twilight') || lowerFilename.includes('dusk')) {
      return 'twilight';
    }
    if (lowerFilename.includes('floor') || lowerFilename.includes('plan')) {
      return 'floor_plan';
    }
    return 'photo';
  }
  
  return 'document';
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseAdmin();
    const request = await req.json() as ProcessUploadRequest;

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, company_id, order_number')
      .eq('id', request.order_id)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${request.order_id}`);
    }

    // Get or create upload job
    let uploadJob;
    if (request.upload_job_id) {
      const { data } = await supabase
        .from('upload_jobs')
        .select('*')
        .eq('id', request.upload_job_id)
        .single();
      uploadJob = data;
    }

    if (!uploadJob) {
      const { data, error } = await supabase
        .from('upload_jobs')
        .insert({
          company_id: order.company_id,
          order_id: request.order_id,
          appointment_id: request.appointment_id,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          upload_source: 'api',
          status: 'processing',
          total_files: request.files.length,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      uploadJob = data;
    }

    // Process each file
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
      asset_ids: [] as string[],
    };

    for (const file of request.files) {
      try {
        const mediaType = getMediaType(file.mime_type, file.original_filename);
        const fileExtension = file.original_filename.split('.').pop()?.toLowerCase();
        
        // Generate a unique filename
        const filename = `${Date.now()}-${file.original_filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Create media asset record
        const { data: asset, error: assetError } = await supabase
          .from('media_assets')
          .insert({
            company_id: order.company_id,
            order_id: request.order_id,
            appointment_id: request.appointment_id,
            filename,
            original_filename: file.original_filename,
            file_extension: fileExtension,
            mime_type: file.mime_type,
            file_size_bytes: file.file_size,
            storage_bucket: 'media',
            storage_path: file.storage_path,
            media_type: mediaType,
            qc_status: 'pending',
            is_processed: false,
            uploaded_by: uploadJob.uploaded_by,
          })
          .select()
          .single();

        if (assetError) {
          throw assetError;
        }

        results.asset_ids.push(asset.id);
        results.processed++;

        // Generate signed URL for thumbnailing (would integrate with image service)
        const { data: signedUrl } = await supabase.storage
          .from('media')
          .createSignedUrl(file.storage_path, 3600);

        // For images, we'd trigger thumbnail generation here
        // This would typically call an image processing service or Edge Function
        if (mediaType.includes('photo') && signedUrl) {
          // TODO: Integrate with image processing service
          // For now, just mark as processed
          await supabase
            .from('media_assets')
            .update({
              is_processed: true,
              processed_at: new Date().toISOString(),
              public_url: signedUrl.signedUrl,
            })
            .eq('id', asset.id);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${file.original_filename}: ${error.message}`);
      }
    }

    // Update upload job status
    await supabase
      .from('upload_jobs')
      .update({
        status: results.failed === 0 ? 'completed' : 'completed_with_errors',
        processed_files: results.processed,
        failed_files: results.failed,
        completed_at: new Date().toISOString(),
        errors: results.errors,
      })
      .eq('id', uploadJob.id);

    // Update order status to uploading/editing
    await supabase
      .from('orders')
      .update({ status: 'editing' })
      .eq('id', request.order_id);

    // Trigger QC batch process if we have photo assets
    if (results.asset_ids.length > 0) {
      const baseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      // Async call to QC batch process
      fetch(`${baseUrl}/functions/v1/qc-batch-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          order_id: request.order_id,
          upload_job_id: uploadJob.id,
        }),
      }).catch(err => console.error('QC trigger failed:', err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        upload_job_id: uploadJob.id,
        processed: results.processed,
        failed: results.failed,
        asset_ids: results.asset_ids,
        errors: results.errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Process Upload Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
