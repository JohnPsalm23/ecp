import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

/**
 * Metrics Endpoint for Prometheus/Grafana
 * 
 * GET /api/metrics - Returns metrics in Prometheus format
 * GET /api/metrics?format=json - Returns metrics in JSON format
 */
export async function GET(request: NextRequest) {
  // Verify secret token in production
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.METRICS_TOKEN;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const format = request.nextUrl.searchParams.get('format');

  if (format === 'json') {
    return NextResponse.json(metrics.toJSON());
  }

  // Default to Prometheus format
  return new NextResponse(metrics.toPrometheus(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
