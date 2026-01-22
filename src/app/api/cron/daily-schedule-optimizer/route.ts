import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Daily Schedule Optimizer Cron Job
 * Runs at 5:30 PM EST (22:30 UTC) daily
 * 
 * This job calls the Supabase Edge Function to optimize the next day's schedule
 * for each active market in their respective timezones.
 */

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, is_active');

    if (companiesError) {
      throw companiesError;
    }

    // Filter active companies
    const activeCompanies = (companies || []).filter(c => c.is_active === true);

    const results: Array<{
      company_id: string;
      company_name: string;
      success: boolean;
      result: unknown;
    }> = [];

    for (const company of activeCompanies) {
      // Call the Edge Function for each company
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/daily-schedule-optimizer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            company_id: company.id,
          }),
        }
      );

      const result = await response.json();
      results.push({
        company_id: company.id,
        company_name: company.name,
        success: response.ok,
        result,
      });
    }

    // Log summary
    console.log('Daily Schedule Optimizer completed:', {
      companies_processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Daily Schedule Optimizer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
