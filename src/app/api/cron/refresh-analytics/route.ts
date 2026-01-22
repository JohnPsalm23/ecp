import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Refresh Analytics Materialized Views
 * Runs every 4 hours
 */

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // Call the refresh function
    const { error } = await supabase.rpc('refresh_analytics_views');

    if (error) {
      throw error;
    }

    console.log('Analytics views refreshed successfully');

    return NextResponse.json({
      success: true,
      message: 'Analytics views refreshed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Refresh analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh analytics views' },
      { status: 500 }
    );
  }
}
