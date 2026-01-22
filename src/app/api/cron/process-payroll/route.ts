import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Process Payroll Cron Job
 * Runs on the 8th and 24th of each month at 6 AM UTC
 * 
 * This job:
 * 1. Calculates photographer earnings for the pay period
 * 2. Generates photographer invoices
 * 3. Prepares data for QuickBooks sync
 */

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Determine pay period
  let periodStart: Date;
  let periodEnd: Date;

  if (dayOfMonth === 8) {
    // Pay period: 24th of last month to 7th of current month
    periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 24);
    periodEnd = new Date(today.getFullYear(), today.getMonth(), 7);
  } else if (dayOfMonth === 24) {
    // Pay period: 8th to 23rd of current month
    periodStart = new Date(today.getFullYear(), today.getMonth(), 8);
    periodEnd = new Date(today.getFullYear(), today.getMonth(), 23);
  } else {
    return NextResponse.json({
      success: false,
      message: 'Not a payroll day',
    });
  }

  try {
    // Get all active photographers
    const { data: photographers, error: photoError } = await supabase
      .from('photographers')
      .select('id, company_id, user_id')
      .eq('is_active', true);

    if (photoError) {
      throw photoError;
    }

    const results = [];

    for (const photographer of photographers || []) {
      // Call the generate-invoice Edge Function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            type: 'photographer',
            photographer_id: photographer.id,
            period_start: format(periodStart, 'yyyy-MM-dd'),
            period_end: format(periodEnd, 'yyyy-MM-dd'),
          }),
        }
      );

      const result = await response.json();
      results.push({
        photographer_id: photographer.id,
        success: response.ok,
        result,
      });
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      action: 'payroll_processed',
      entity_type: 'photographer_invoices',
      metadata: {
        period_start: format(periodStart, 'yyyy-MM-dd'),
        period_end: format(periodEnd, 'yyyy-MM-dd'),
        photographers_processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });

    console.log('Payroll processing completed:', {
      period: `${format(periodStart, 'yyyy-MM-dd')} to ${format(periodEnd, 'yyyy-MM-dd')}`,
      photographers_processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });

    return NextResponse.json({
      success: true,
      period: {
        start: format(periodStart, 'yyyy-MM-dd'),
        end: format(periodEnd, 'yyyy-MM-dd'),
      },
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Payroll processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process payroll' },
      { status: 500 }
    );
  }
}
