'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  Users,
  Camera,
  ImageIcon,
  FileCheck,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Building2,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Photographers', href: '/dashboard/photographers', icon: Camera },
  { name: 'Media Library', href: '/dashboard/media', icon: ImageIcon },
  { name: 'Quality Control', href: '/dashboard/qc', icon: FileCheck },
  { name: 'Finance', href: '/dashboard/finance', icon: DollarSign },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">ECP Platform</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Market Selector */}
        <div className="p-4 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>All Markets</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Select Market</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Building2 className="w-4 h-4 mr-2" />
                All Markets
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MapPin className="w-4 h-4 mr-2" />
                Atlanta, GA
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MapPin className="w-4 h-4 mr-2" />
                Dallas, TX
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MapPin className="w-4 h-4 mr-2" />
                Miami, FL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.first_name?.[0]}
                    {profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{profile?.display_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/profile">
                  <Users className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background/95 backdrop-blur border-b lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Search */}
            <div className="hidden sm:block w-80">
              <Input
                placeholder="Search orders, customers..."
                className="h-9"
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
