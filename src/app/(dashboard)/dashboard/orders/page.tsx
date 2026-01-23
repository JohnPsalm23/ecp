import { Suspense } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Download,
  MapPin,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  en_route: 'En Route',
  started: 'Started',
  completed: 'Completed',
  uploading: 'Uploading',
  editing: 'Editing',
  qc_pending: 'QC Pending',
  qc_failed: 'QC Failed',
  qc_passed: 'QC Passed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
};

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  en_route: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  started: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  uploading: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  editing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  qc_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  qc_failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  qc_passed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface OrderWithRelations {
  id: string;
  order_number: string;
  status: string;
  total: number | null;
  preferred_date: string | null;
  created_at: string;
  customer: { id: string; first_name: string; last_name: string; email: string } | null;
  property: { id: string; formatted_address: string; city: string; state: string } | null;
}

async function OrdersList() {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total,
      preferred_date,
      created_at,
      customer:customers(id, first_name, last_name, email),
      property:properties(id, formatted_address, city, state)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const orders = data as OrderWithRelations[] | null;

  if (error) {
    console.error('Error fetching orders:', error);
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Error loading orders</p>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No orders yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first order to get started
          </p>
          <Button className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const { customer, property } = order;
        
        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Order Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-semibold">
                    {order.order_number?.slice(-3) || '---'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{order.order_number}</span>
                      <Badge className={statusStyles[order.status] || statusStyles.draft}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                    {customer && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{customer.first_name} {customer.last_name}</span>
                      </div>
                    )}
                    {property && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{property.formatted_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Total */}
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    {order.preferred_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(order.preferred_date)}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {formatDate(order.created_at)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(order.total || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders across markets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
