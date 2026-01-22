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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
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
      </CardContent>
    </Card>
  );
}

// Recent Orders Component
function RecentOrders() {
  const orders = [
    { id: 'ORD-001234', customer: 'John Smith', property: '123 Main St, Atlanta', status: 'scheduled', time: '10:00 AM' },
    { id: 'ORD-001235', customer: 'Sarah Johnson', property: '456 Oak Ave, Dallas', status: 'in_progress', time: '11:30 AM' },
    { id: 'ORD-001236', customer: 'Mike Williams', property: '789 Pine Rd, Miami', status: 'completed', time: '2:00 PM' },
    { id: 'ORD-001237', customer: 'Emily Brown', property: '321 Elm St, Atlanta', status: 'qc_pending', time: '3:30 PM' },
    { id: 'ORD-001238', customer: 'David Lee', property: '654 Maple Dr, Dallas', status: 'delivered', time: '4:00 PM' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'status-scheduled',
      in_progress: 'status-in-progress',
      completed: 'status-completed',
      qc_pending: 'qc-warning',
      delivered: 'status-completed',
    };
    const labels: Record<string, string> = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      qc_pending: 'QC Pending',
      delivered: 'Delivered',
    };
    return <span className={`status-badge ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders across all markets</CardDescription>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm">{order.property}</p>
                <p className="text-xs text-muted-foreground">{order.time}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Today's Schedule Component
function TodaySchedule() {
  const appointments = [
    { time: '9:00 AM', photographer: 'Alex Rivera', property: '123 Main St', duration: '1h 30m' },
    { time: '10:30 AM', photographer: 'Jamie Chen', property: '456 Oak Ave', duration: '2h' },
    { time: '1:00 PM', photographer: 'Alex Rivera', property: '789 Pine Rd', duration: '1h' },
    { time: '3:00 PM', photographer: 'Sam Wilson', property: '321 Elm St', duration: '2h 30m' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Today&apos;s Schedule</CardTitle>
          <CardDescription>Upcoming appointments for today</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          View Calendar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.map((apt, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
              <div className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg bg-primary/10">
                <span className="text-xs font-medium text-primary">{apt.time.split(' ')[0]}</span>
                <span className="text-[10px] text-muted-foreground">{apt.time.split(' ')[1]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{apt.property}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="w-3 h-3" />
                  <span>{apt.photographer}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{apt.duration}</span>
                </div>
              </div>
              <Badge variant="secondary">{idx === 0 ? 'Next' : 'Upcoming'}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// QC Summary Component
function QCSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QC Summary</CardTitle>
        <CardDescription>Quality control status for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Passed</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">24</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="font-medium">Warnings</span>
            </div>
            <span className="text-2xl font-bold text-amber-600">8</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium">Failed</span>
            </div>
            <span className="text-2xl font-bold text-red-600">3</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average Score</span>
            <span className="font-semibold">87/100</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          </div>
        </div>
      </CardContent>
    </Card>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Orders"
          value="24"
          change="+12%"
          changeType="positive"
          icon={ShoppingCart}
          description="vs yesterday"
        />
        <MetricCard
          title="Active Photographers"
          value="8"
          change="2 available"
          changeType="neutral"
          icon={Camera}
        />
        <MetricCard
          title="Today's Revenue"
          value="$4,280"
          change="+8.5%"
          changeType="positive"
          icon={DollarSign}
          description="vs last week avg"
        />
        <MetricCard
          title="QC Pass Rate"
          value="92%"
          change="+3%"
          changeType="positive"
          icon={TrendingUp}
          description="vs last month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<div className="h-96 skeleton" />}>
            <RecentOrders />
          </Suspense>
          <Suspense fallback={<div className="h-80 skeleton" />}>
            <TodaySchedule />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<div className="h-72 skeleton" />}>
            <QCSummary />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
