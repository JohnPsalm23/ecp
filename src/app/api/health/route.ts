import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Health Check Endpoint
 * 
 * Used by:
 * - Load balancers
 * - Kubernetes readiness probes
 * - Uptime monitoring services
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    storage: CheckResult;
    auth: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'fail';
  latency?: number;
  message?: string;
}

const startTime = Date.now();

async function checkDatabase(): Promise<CheckResult> {
  const start = performance.now();
  
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from('companies').select('id').limit(1);
    
    if (error) {
      return { status: 'fail', message: error.message };
    }
    
    return { 
      status: 'pass', 
      latency: Math.round(performance.now() - start) 
    };
  } catch (error) {
    return { 
      status: 'fail', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function checkStorage(): Promise<CheckResult> {
  const start = performance.now();
  
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { status: 'fail', message: error.message };
    }
    
    return { 
      status: 'pass', 
      latency: Math.round(performance.now() - start) 
    };
  } catch (error) {
    return { 
      status: 'fail', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function checkAuth(): Promise<CheckResult> {
  const start = performance.now();
  
  try {
    const supabase = await createAdminClient();
    // Simple auth check - just verify the client can be created
    const { data } = await supabase.auth.getSession();
    
    return { 
      status: 'pass', 
      latency: Math.round(performance.now() - start) 
    };
  } catch (error) {
    return { 
      status: 'fail', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function GET() {
  const [database, storage, auth] = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkAuth(),
  ]);

  const checks = { database, storage, auth };
  
  // Determine overall status
  const failedChecks = Object.values(checks).filter(c => c.status === 'fail');
  let status: HealthStatus['status'];
  
  if (failedChecks.length === 0) {
    status = 'healthy';
  } else if (failedChecks.length < Object.keys(checks).length) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  const health: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks,
  };

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// Lightweight liveness check for Kubernetes
export async function HEAD() {
  return new Response(null, { status: 200 });
}
