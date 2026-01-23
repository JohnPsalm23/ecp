import { Suspense } from 'react';
import {
  ShoppingCart,
  Camera,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {change}
            </Badge>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  customer: { first_name: string; last_name: string } | null;
  property: { formatted_address: string } | null;
}

// Recent Orders Component
async function RecentOrders() {
  const supabase = await createServerSupabaseClient();
  
  const { data } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      created_at,
      customer:customers(first_name, last_name),
      property:properties(formatted_address)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const orders = data as RecentOrder[] | null;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      qc_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    };
    const labels: Record<string, string> = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      qc_pending: 'QC Pending',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>No orders yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Create your first order to get started</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/orders">Go to Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders across all markets</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const customer = order.customer as { first_name: string; last_name: string } | null;
            const property = order.property as { formatted_address: string } | null;
            
            return (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer ? `${customer.first_name} ${customer.last_name}` : 'No customer'}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm truncate max-w-[200px]">
                    {property?.formatted_address || 'No address'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Stats
async function DashboardStats() {
  const supabase = await createServerSupabaseClient();
  
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  
  // Count today's orders
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO);

  // Count active photographers
  const { count: activePhotographers } = await supabase
    .from('photographers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Count QC jobs passed today
  const { count: qcPassed } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'passed')
    .gte('created_at', todayISO);

  const { count: qcTotal } = await supabase
    .from('qc_jobs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO);

  const qcRate = qcTotal && qcTotal > 0 ? Math.round(((qcPassed || 0) / qcTotal) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Today's Orders"
        value={String(todayOrders || 0)}
        icon={ShoppingCart}
      />
      <MetricCard
        title="Active Photographers"
        value={String(activePhotographers || 0)}
        icon={Camera}
      />
      <MetricCard
        title="QC Jobs Today"
        value={String(qcTotal || 0)}
        icon={CheckCircle}
      />
      <MetricCard
        title="QC Pass Rate"
        value={`${qcRate}%`}
        icon={TrendingUp}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Metrics Grid */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
        <DashboardStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <RecentOrders />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/orders">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Orders
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/qc">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Quality Control
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
