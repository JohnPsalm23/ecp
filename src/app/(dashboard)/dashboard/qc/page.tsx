'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  RotateCcw,
  Filter,
  Search,
  ArrowUpRight,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn, formatDate } from '@/lib/utils';

// Mock QC data
const qcJobs = [
  {
    id: '1',
    order_number: 'ORD-001234',
    property: '123 Main St, Atlanta',
    photographer: 'Alex Rivera',
    status: 'passed',
    overall_score: 94,
    total_assets: 25,
    passed: 23,
    warnings: 2,
    failed: 0,
    completed_at: '2026-01-22T14:30:00Z',
    thumbnail: '/placeholder-house.jpg',
  },
  {
    id: '2',
    order_number: 'ORD-001235',
    property: '456 Oak Ave, Dallas',
    photographer: 'Jamie Chen',
    status: 'warning',
    overall_score: 78,
    total_assets: 32,
    passed: 24,
    warnings: 6,
    failed: 2,
    completed_at: '2026-01-22T12:15:00Z',
    thumbnail: '/placeholder-house.jpg',
  },
  {
    id: '3',
    order_number: 'ORD-001236',
    property: '789 Pine Rd, Miami',
    photographer: 'Sam Wilson',
    status: 'failed',
    overall_score: 52,
    total_assets: 28,
    passed: 12,
    warnings: 8,
    failed: 8,
    completed_at: '2026-01-22T10:45:00Z',
    thumbnail: '/placeholder-house.jpg',
  },
  {
    id: '4',
    order_number: 'ORD-001237',
    property: '321 Elm St, Atlanta',
    photographer: 'Alex Rivera',
    status: 'pending',
    overall_score: null,
    total_assets: 30,
    passed: 0,
    warnings: 0,
    failed: 0,
    completed_at: null,
    thumbnail: '/placeholder-house.jpg',
  },
];

const issueTypes = [
  { type: 'exposure', count: 12, description: 'Exposure issues' },
  { type: 'blur', count: 8, description: 'Motion blur or focus' },
  { type: 'composition', count: 6, description: 'Crooked horizons' },
  { type: 'reflections', count: 4, description: 'Photographer visible' },
  { type: 'dust', count: 3, description: 'Dust spots detected' },
];

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

function getProgressColor(score: number | null) {
  if (score === null) return 'bg-muted';
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function QCPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const stats = {
    total: qcJobs.length,
    passed: qcJobs.filter(j => j.status === 'passed').length,
    warnings: qcJobs.filter(j => j.status === 'warning').length,
    failed: qcJobs.filter(j => j.status === 'failed').length,
    pending: qcJobs.filter(j => j.status === 'pending').length,
  };

  const averageScore = qcJobs
    .filter(j => j.overall_score !== null)
    .reduce((sum, j) => sum + (j.overall_score || 0), 0) / 
    qcJobs.filter(j => j.overall_score !== null).length;

  const filteredJobs = filter 
    ? qcJobs.filter(j => j.status === filter)
    : qcJobs;

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="card-hover cursor-pointer" onClick={() => setFilter(null)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Jobs</span>
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card 
          className={cn('card-hover cursor-pointer', filter === 'passed' && 'ring-2 ring-emerald-500')}
          onClick={() => setFilter(filter === 'passed' ? null : 'passed')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Passed</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-500">{stats.passed}</div>
          </CardContent>
        </Card>

        <Card 
          className={cn('card-hover cursor-pointer', filter === 'warning' && 'ring-2 ring-amber-500')}
          onClick={() => setFilter(filter === 'warning' ? null : 'warning')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Warnings</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-500">{stats.warnings}</div>
          </CardContent>
        </Card>

        <Card 
          className={cn('card-hover cursor-pointer', filter === 'failed' && 'ring-2 ring-red-500')}
          onClick={() => setFilter(filter === 'failed' ? null : 'failed')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-red-500">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Score</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div className={cn('mt-2 text-2xl font-bold', getScoreColor(averageScore))}>
              {Math.round(averageScore)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* QC Jobs List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>QC Jobs</CardTitle>
                <div className="w-64">
                  <Input
                    placeholder="Search orders..."
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium">{job.order_number}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{job.property}</p>
                      <p className="text-xs text-muted-foreground">By {job.photographer}</p>
                    </div>

                    <div className="hidden sm:block text-right">
                      <div className={cn('text-lg font-bold', getScoreColor(job.overall_score))}>
                        {job.overall_score !== null ? job.overall_score : '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.total_assets} assets
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-1 w-32">
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-500">{job.passed}</span>
                        <span className="text-amber-500">{job.warnings}</span>
                        <span className="text-red-500">{job.failed}</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                        <div 
                          className="bg-emerald-500" 
                          style={{ width: `${(job.passed / job.total_assets) * 100}%` }} 
                        />
                        <div 
                          className="bg-amber-500" 
                          style={{ width: `${(job.warnings / job.total_assets) * 100}%` }} 
                        />
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(job.failed / job.total_assets) * 100}%` }} 
                        />
                      </div>
                    </div>

                    <Button variant="ghost" size="icon-sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issue Types Breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>Top issues detected by AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issueTypes.map((issue) => (
                  <div key={issue.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{issue.description}</span>
                      <span className="font-medium">{issue.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(issue.count / issueTypes[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>Powered by GPT-4 Vision</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    <strong>Trend Alert:</strong> Exposure issues have increased 15% this week. 
                    Consider sending a reminder to photographers about HDR bracketing.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    <strong>Top Performer:</strong> Alex Rivera has maintained a 96% QC pass rate 
                    over the last 30 days.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
