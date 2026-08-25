/**
 * Admin Dashboard Page.
 *
 * Modern, elegant admin panel with animated stats,
 * tabbed navigation, and dark mode support.
 */

import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ClipboardList,
  Palette,
  Bell,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Star,
  Megaphone,
  Image as ImageIcon,
  Activity,
  Clock,
  Users as UsersIcon,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useThemeStore } from '@/stores';
import { menuApi, staffApi, notificationApi, analyticsApi } from '@/lib/api';
import { formatPrice } from '@eato/shared/utils';
import type { ReportPeriod, ReportData } from '@eato/shared/types';
import type { MenuItemWithCategory, User, Notification } from '@eato/shared/types';

type AdminTab = 'overview' | 'menu' | 'staff' | 'orders' | 'notifications' | 'reports' | 'theme';

const THEME_COLORS = [
  { name: 'Orange', value: '#ea580c' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Teal', value: '#0d9488' },
];

const TABS: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'theme', label: 'Theme', icon: Palette },
];

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="container px-4 py-8 lg:px-8">
        <div className="mb-8 animate-fade-in-down">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20 animate-scale-in">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground ml-[52px]">
            Manage your restaurant
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)}>
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <TabsList className="h-auto p-1.5 bg-card/60 backdrop-blur-xl border border-border/40 shadow-sm rounded-2xl w-full overflow-x-auto flex lg:w-fit">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent key={activeTab} value={activeTab} className="mt-0 animate-fade-in">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'menu' && <MenuTab />}
            {activeTab === 'staff' && <StaffTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'theme' && <ThemeTab />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  trendValue,
  gradient,
  delay = 0,
}: {
  icon: typeof LayoutDashboard;
  value: string;
  label: string;
  trend: 'up' | 'down';
  trendValue: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <Card
      className="group relative overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trendValue}
          </span>
          <span className="text-sm text-muted-foreground">vs yesterday</span>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab() {
  const orders = useAnimatedCounter(24);
  const revenue = useAnimatedCounter(1240);
  const active = useAnimatedCounter(8);
  const items = useAnimatedCounter(12);

  const recentOrders = [
    { id: '#1234', customer: 'Sarah M.', items: 3, total: 45.99, status: 'delivered' as const, time: '2 min ago' },
    { id: '#1233', customer: 'James K.', items: 1, total: 18.50, status: 'preparing' as const, time: '5 min ago' },
    { id: '#1232', customer: 'Emma L.', items: 5, total: 72.00, status: 'on_the_way' as const, time: '8 min ago' },
    { id: '#1231', customer: 'Mike R.', items: 2, total: 33.25, status: 'pending' as const, time: '12 min ago' },
  ];

  const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'destructive' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    preparing: { label: 'Preparing', variant: 'info' },
    on_the_way: { label: 'On the Way', variant: 'default' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
  };

  const quickActions = [
    { label: 'Add Menu Item', icon: Plus, color: 'from-primary to-orange-400' },
    { label: 'View Orders', icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
    { label: 'Send Notification', icon: Bell, color: 'from-purple-500 to-purple-600' },
    { label: 'View Reports', icon: BarChart3, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          value={orders.toString()}
          label="Today's Orders"
          trend="up"
          trendValue="+12%"
          gradient="from-primary to-orange-400"
          delay={0}
        />
        <StatCard
          icon={DollarSign}
          value={`$${revenue.toLocaleString()}`}
          label="Revenue"
          trend="up"
          trendValue="+8%"
          gradient="from-green-500 to-emerald-600"
          delay={60}
        />
        <StatCard
          icon={Activity}
          value={active.toString()}
          label="Active Orders"
          trend="up"
          trendValue="+3"
          gradient="from-blue-500 to-indigo-600"
          delay={120}
        />
        <StatCard
          icon={UtensilsCrossed}
          value={items.toString()}
          label="Menu Items"
          trend="up"
          trendValue="+2"
          gradient="from-purple-500 to-violet-600"
          delay={180}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order, i) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 group animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + i * 0.08}s`, animationFillMode: 'both' }}
                  >
                    <Avatar fallback={order.customer.charAt(0)} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.customer}</span>
                        <span className="text-xs text-muted-foreground">{order.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items} item{order.items > 1 ? 's' : ''} &middot; {order.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total)}</p>
                      <Badge variant={statusConfig[order.status].variant} className="text-[10px] mt-1">
                        {statusConfig[order.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MenuTab() {
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const itemsRes = await menuApi.getItems({ limit: 50 });
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    try {
      await menuApi.updateItem(id, { isAvailable: !current });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: !current } : item
        )
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await menuApi.updateItem(id, { isFeatured: !current });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFeatured: !current } : item
        )
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading menu items..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-muted-foreground text-sm">Manage your menu items and availability</p>
        </div>
        <Button variant="gradient" className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <Card
            key={item.id}
            className="group animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.isFeatured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <Badge variant="secondary">{item.category.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFeatured(item.id, item.isFeatured)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                      item.isFeatured
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${item.isFeatured ? 'fill-yellow-500' : ''}`} />
                  </button>

                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => toggleAvailability(item.id, item.isAvailable)}
                  />

                  <button className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95">
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StaffTab() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const data = await staffApi.getStaff();
      setStaff(data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading staff..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground text-sm">View and manage your team members</p>
        </div>
        <Button variant="gradient" className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member, i) => (
          <Card
            key={member.id}
            className="group animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  fallback={member.name.charAt(0).toUpperCase()}
                  size="lg"
                  className="mb-3 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all"
                />
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {member.role}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [filter, setFilter] = useState('all');

  const orders = [
    { id: '#1234', customer: 'Sarah M.', items: ['Classic Burger', 'Fries', 'Cola'], total: 45.99, status: 'delivered', time: '2 min ago', address: '123 Main St' },
    { id: '#1233', customer: 'James K.', items: ['Margherita Pizza'], total: 18.50, status: 'preparing', time: '5 min ago', address: '456 Oak Ave' },
    { id: '#1232', customer: 'Emma L.', items: ['Grilled Salmon', 'Caesar Salad', 'Wine', 'Tiramisu', 'Bread'], total: 72.00, status: 'on_the_way', time: '8 min ago', address: '789 Pine Rd' },
    { id: '#1231', customer: 'Mike R.', items: ['Chicken Wings', 'Onion Rings'], total: 33.25, status: 'pending', time: '12 min ago', address: '321 Elm St' },
    { id: '#1230', customer: 'Lisa T.', items: ['Veggie Bowl'], total: 22.00, status: 'delivered', time: '15 min ago', address: '654 Maple Dr' },
  ];

  const filters = ['all', 'pending', 'preparing', 'on_the_way', 'delivered'];

  const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'destructive'; color: string }> = {
    pending: { label: 'Pending', variant: 'warning', color: 'bg-yellow-500' },
    preparing: { label: 'Preparing', variant: 'info', color: 'bg-blue-500' },
    on_the_way: { label: 'On the Way', variant: 'default', color: 'bg-primary' },
    delivered: { label: 'Delivered', variant: 'success', color: 'bg-green-500' },
    cancelled: { label: 'Cancelled', variant: 'destructive', color: 'bg-red-500' },
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <p className="text-muted-foreground text-sm">Track and manage all orders in real-time</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize whitespace-nowrap rounded-xl"
          >
            {f.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, i) => (
          <Card
            key={order.id}
            className="group animate-fade-in-up"
            style={{ animationDelay: `${0.15 + i * 0.05}s`, animationFillMode: 'both' }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`h-3 w-3 rounded-full mt-1.5 flex-shrink-0 ${statusConfig[order.status].color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.id}</span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                    <Badge variant={statusConfig[order.status].variant}>
                      {statusConfig[order.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.items.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Update
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'ticker' as 'ticker' | 'popup',
    title: '',
    message: '',
    image: '',
    link: '',
    isActive: true,
    priority: 0,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const result = await notificationApi.getAll({ limit: 50 });
      setNotifications(result.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ type: 'ticker', title: '', message: '', image: '', link: '', isActive: true, priority: 0 });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(n: Notification) {
    setForm({
      type: n.type,
      title: n.title,
      message: n.message,
      image: n.image || '',
      link: n.link || '',
      isActive: n.isActive,
      priority: n.priority,
    });
    setEditingId(n.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = {
        ...form,
        image: form.image || undefined,
        link: form.link || undefined,
      };
      if (editingId) {
        await notificationApi.update(editingId, data);
      } else {
        await notificationApi.create(data);
      }
      resetForm();
      loadNotifications();
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this notification?')) return;
    try {
      await notificationApi.delete(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await notificationApi.update(id, { isActive: !current });
      loadNotifications();
    } catch (error) {
      console.error('Failed to toggle notification:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground text-sm">Manage news tickers and popups</p>
        </div>
        <Button variant="gradient" onClick={() => { resetForm(); setShowForm(true); }} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Notification
        </Button>
      </div>

      {showForm && (
        <div className="animate-slide-down">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Notification' : 'New Notification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={form.type === 'ticker' ? 'default' : 'outline'}
                        onClick={() => setForm({ ...form, type: 'ticker' })}
                        className="flex-1"
                      >
                        <Megaphone className="h-4 w-4 mr-2" />
                        Ticker
                      </Button>
                      <Button
                        type="button"
                        variant={form.type === 'popup' ? 'default' : 'outline'}
                        onClick={() => setForm({ ...form, type: 'popup' })}
                        className="flex-1"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Popup
                      </Button>
                    </div>
                  </div>
                  <Input
                    label="Priority (0-100)"
                    type="number"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  />
                </div>

                <Input
                  label="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Happy Hour Special!"
                  required
                />

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="e.g. 50% off all drinks from 5-7 PM"
                    required
                  />
                </div>

                {form.type === 'popup' && (
                  <Input
                    label="Image URL (optional)"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                )}

                <Input
                  label="Link URL (optional)"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com/promo"
                />

                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingId ? 'Update' : 'Create'} Notification
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No notifications yet. Create your first one!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n, i) => (
            <Card
              key={n.id}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.type === 'ticker'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {n.type === 'ticker' ? <Megaphone className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{n.title}</h3>
                      <Badge variant={n.type === 'ticker' ? 'info' : 'secondary'} className="text-xs">
                        {n.type}
                      </Badge>
                      <Badge variant={n.isActive ? 'success' : 'outline'} className="text-xs" dot>
                        {n.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={n.isActive}
                      onCheckedChange={() => toggleActive(n.id, n.isActive)}
                    />
                    <button
                      onClick={() => startEdit(n)}
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [period]);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await analyticsApi.getReport(period);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading reports..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Failed to load reports
      </div>
    );
  }

  const { overview, revenueTrend, popularItems, peakHours } = report;

  const maxRevenue = Math.max(...revenueTrend.map((d: { revenue: number }) => d.revenue), 1);
  const maxOrders = Math.max(...peakHours.map((d: { orders: number }) => d.orders), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground text-sm">Track your restaurant performance</p>
        </div>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="rounded-xl"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(overview.totalRevenue)}</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{overview.totalOrders.toLocaleString()}</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(overview.avgOrderValue)}</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Customers</p>
                <p className="text-2xl font-bold mt-1">{overview.newCustomers.toLocaleString()}</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTrend.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No revenue data for this period</p>
            ) : (
              <div className="h-64 flex items-end gap-1">
                {revenueTrend.map((point: { date: string; revenue: number }, i: number) => (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col items-center gap-1 animate-scale-in"
                    style={{ animationDelay: `${0.3 + i * 0.02}s`, animationFillMode: 'both' }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg min-h-[4px] hover:from-primary hover:to-primary transition-all cursor-pointer"
                      style={{ height: `${(point.revenue / maxRevenue) * 200}px` }}
                      title={`${point.date}: ${formatPrice(point.revenue)}`}
                    />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {point.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {peakHours.every((h: { hour: number; orders: number }) => h.orders === 0) ? (
              <p className="text-center text-muted-foreground py-8">No order data yet</p>
            ) : (
              <div className="h-48 flex items-end gap-0.5">
                {peakHours.map((point: { hour: number; orders: number }, i: number) => (
                  <div
                    key={point.hour}
                    className="flex-1 flex flex-col items-center gap-1 animate-scale-in"
                    style={{ animationDelay: `${0.35 + i * 0.015}s`, animationFillMode: 'both' }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-primary/60 to-primary/30 rounded-t-sm min-h-[2px] hover:from-primary hover:to-primary transition-colors cursor-pointer"
                      style={{ height: `${(point.orders / maxOrders) * 160}px` }}
                      title={`${point.hour}:00 - ${point.orders} orders`}
                    />
                    {point.hour % 3 === 0 && (
                      <span className="text-[9px] text-muted-foreground">{point.hour}h</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle className="text-lg">Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          {popularItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No order data yet</p>
          ) : (
            <div className="space-y-4">
              {popularItems.slice(0, 5).map((item: { menuItem?: { id: string; name: string }; totalQuantity: number; totalRevenue: number }, idx: number) => (
                <div key={item.menuItem?.id} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.menuItem?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.totalQuantity} sold &middot; {formatPrice(item.totalRevenue)}
                    </p>
                  </div>
                  <Progress
                    value={item.totalQuantity}
                    max={popularItems[0]?.totalQuantity || 1}
                    className="w-24 h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeTab() {
  const { primaryColor, setPrimaryColor, theme, setTheme } = useThemeStore() as {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    theme: string;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
  };

  const modes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold">Theme Customization</h2>
        <p className="text-muted-foreground text-sm">
          Customize the appearance of your restaurant's ordering system
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Color Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setPrimaryColor(color.value);
                    document.documentElement.className = color.value === '#ea580c' ? '' : `theme-${color.name.toLowerCase()}`;
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    primaryColor === color.value
                      ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10'
                      : 'border-transparent hover:border-muted'
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full shadow-md transition-transform"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setTheme(mode.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-102 active:scale-98 ${
                      theme === mode.value
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${theme === mode.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${theme === mode.value ? 'text-primary' : 'text-muted-foreground'}`}>
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <CardHeader>
          <CardTitle className="text-lg">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-3">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={65} className="flex-1" />
              <span className="text-sm text-muted-foreground">65%</span>
            </div>
            <div className="flex items-center gap-3">
              <Input placeholder="Input field" className="max-w-xs" />
              <Select
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                ]}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
