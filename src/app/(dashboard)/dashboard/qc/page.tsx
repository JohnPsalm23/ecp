import { Suspense } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  RotateCcw,
  ImageIcon,
  FileSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getStatusIcon(status: string) {
  switch (status) {
    case 'passed':
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />;
  }
}

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

async function QCStats() {
  const supabase = await createServerSupabaseClient();
  
  const { count: totalJobs } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true });

  const { count: passedJobs } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'passed');

  const { count: warningJobs } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'warning');

  const { count: failedJobs } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  const { count: pendingJobs } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Calculate average score
  const { data: scores } = await supabase
    .from('qc_jobs')
    .select('overall_score')
    .not('overall_score', 'is', null);

  const avgScore = scores && scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length)
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Jobs</span>
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold">{totalJobs || 0}</div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Passed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-500">{passedJobs || 0}</div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-500">{warningJobs || 0}</div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Failed</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-500">{failedJobs || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</span>
          </div>
          <div className="mt-2">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className={`h-full rounded-full ${avgScore >= 80 ? 'bg-emerald-500' : avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QCJobWithRelations {
  id: string;
  status: string;
  overall_score: number | null;
  total_assets: number | null;
  passed_count: number | null;
  warning_count: number | null;
  failed_count: number | null;
  created_at: string;
  order: { order_number: string; property: { formatted_address: string } | null } | null;
}

async function QCJobsList() {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('qc_jobs')
    .select(`
      id,
      status,
      overall_score,
      total_assets,
      passed_count,
      warning_count,
      failed_count,
      created_at,
      order:orders(order_number, property:properties(formatted_address))
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  const qcJobs = data as QCJobWithRelations[] | null;

  if (error) {
    console.error('Error fetching QC jobs:', error);
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Error loading QC jobs</p>
        </CardContent>
      </Card>
    );
  }

  if (!qcJobs || qcJobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileSearch className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No QC jobs yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            QC jobs will appear here when media is uploaded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>QC Jobs</CardTitle>
        <CardDescription>Recent quality control analyses</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {qcJobs.map((job) => {
            const order = job.order as { order_number: string; property: { formatted_address: string } | null } | null;
            const totalAssets = job.total_assets || 1;
            const passed = job.passed_count || 0;
            const warnings = job.warning_count || 0;
            const failed = job.failed_count || 0;
            
            return (
              <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className="font-medium">{order?.order_number || 'Unknown Order'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order?.property?.formatted_address || 'No address'}
                  </p>
                </div>

                <div className="hidden sm:block text-right">
                  <div className={`text-lg font-bold ${getScoreColor(job.overall_score)}`}>
                    {job.overall_score !== null ? job.overall_score : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalAssets} assets
                  </div>
                </div>

                <div className="hidden md:flex flex-col gap-1 w-32">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-500">{passed}</span>
                    <span className="text-amber-500">{warnings}</span>
                    <span className="text-red-500">{failed}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    <div 
                      className="bg-emerald-500" 
                      style={{ width: `${(passed / totalAssets) * 100}%` }} 
                    />
                    <div 
                      className="bg-amber-500" 
                      style={{ width: `${(warnings / totalAssets) * 100}%` }} 
                    />
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(failed / totalAssets) * 100}%` }} 
                    />
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function QCPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
          <p className="text-muted-foreground">AI-powered media quality analysis</p>
        </div>
        <Button>
          <RotateCcw className="w-4 h-4 mr-2" />
          Re-run All Pending
        </Button>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
        <QCStats />
      </Suspense>

      {/* QC Jobs List */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <QCJobsList />
      </Suspense>
    </div>
  );
}
