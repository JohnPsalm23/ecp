'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency, formatDate, getOrderStatusColor } from '@/lib/utils';

// Mock data - in real app would come from Supabase
const orders = [
  {
    id: '1',
    order_number: 'ORD-001234',
    customer: { name: 'John Smith', email: 'john@realty.com' },
    property: { address: '123 Main St, Atlanta, GA 30301' },
    status: 'scheduled',
    total: 450,
    preferred_date: '2026-01-22',
    preferred_time: '10:00 AM',
    photographer: { name: 'Alex Rivera' },
    products: ['Premium Photos', 'Drone Package'],
    created_at: '2026-01-20T10:30:00Z',
  },
  {
    id: '2',
    order_number: 'ORD-001235',
    customer: { name: 'Sarah Johnson', email: 'sarah@properties.com' },
    property: { address: '456 Oak Ave, Dallas, TX 75201' },
    status: 'in_progress',
    total: 650,
    preferred_date: '2026-01-22',
    preferred_time: '11:30 AM',
    photographer: { name: 'Jamie Chen' },
    products: ['Premium Photos', 'Video Tour', 'Floor Plan'],
    created_at: '2026-01-19T14:00:00Z',
  },
  {
    id: '3',
    order_number: 'ORD-001236',
    customer: { name: 'Mike Williams', email: 'mike@homes.com' },
    property: { address: '789 Pine Rd, Miami, FL 33101' },
    status: 'qc_pending',
    total: 375,
    preferred_date: '2026-01-21',
    preferred_time: '2:00 PM',
    photographer: { name: 'Sam Wilson' },
    products: ['Standard Photos', 'Twilight'],
    created_at: '2026-01-18T09:15:00Z',
  },
  {
    id: '4',
    order_number: 'ORD-001237',
    customer: { name: 'Emily Brown', email: 'emily@luxuryrealty.com' },
    property: { address: '321 Elm St, Atlanta, GA 30302' },
    status: 'delivered',
    total: 850,
    preferred_date: '2026-01-20',
    preferred_time: '9:00 AM',
    photographer: { name: 'Alex Rivera' },
    products: ['Premium Photos', 'Drone Package', 'Video Tour', 'Matterport'],
    created_at: '2026-01-17T16:45:00Z',
  },
  {
    id: '5',
    order_number: 'ORD-001238',
    customer: { name: 'David Lee', email: 'david@premier.com' },
    property: { address: '654 Maple Dr, Dallas, TX 75202' },
    status: 'qc_failed',
    total: 550,
    preferred_date: '2026-01-21',
    preferred_time: '3:30 PM',
    photographer: { name: 'Jamie Chen' },
    products: ['Premium Photos', 'Drone Package'],
    created_at: '2026-01-16T11:20:00Z',
  },
];

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

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.property.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search orders, customers, addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter ? statusLabels[statusFilter] : 'All Status'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All Status
                  </DropdownMenuItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Order Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-semibold">
                    {order.order_number.slice(-3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {order.order_number}
                      </Link>
                      <Badge className={cn('status-badge', getOrderStatusColor(order.status))}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{order.property.address}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Products */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(order.preferred_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{order.preferred_time}</span>
                    </div>
                    {order.photographer && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium">{order.photographer.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <div className="flex flex-wrap gap-1">
                      {order.products.slice(0, 2).map((product) => (
                        <Badge key={product} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {order.products.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{order.products.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.created_at, 'MMM d')}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
