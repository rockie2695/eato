/**
 * Admin Dashboard Page.
 *
 * Provides admin controls for:
 * - Menu management (CRUD)
 * - Staff management
 * - Order overview
 * - Theme customization
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ClipboardList,
  Palette,
  Bell,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Megaphone,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useThemeStore } from '@/stores';
import { menuApi, staffApi, notificationApi, analyticsApi } from '@/lib/api';
import { formatPrice } from '@eato/shared/utils';
import type { ReportPeriod, ReportData } from '@eato/shared/types';
import type { MenuItemWithCategory, User, Notification } from '@eato/shared/types';

type AdminTab = 'overview' | 'menu' | 'staff' | 'orders' | 'notifications' | 'reports' | 'theme';

const THEME_COLORS = [
  { name: 'Orange', value: '#ea580c', class: '' },
  { name: 'Blue', value: '#2563eb', class: 'theme-blue' },
  { name: 'Green', value: '#16a34a', class: 'theme-green' },
  { name: 'Purple', value: '#9333ea', class: 'theme-purple' },
  { name: 'Rose', value: '#e11d48', class: 'theme-rose' },
  { name: 'Teal', value: '#0d9488', class: 'theme-teal' },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'theme', label: 'Theme', icon: Palette },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your restaurant</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'menu' && <MenuTab />}
          {activeTab === 'staff' && <StaffTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'theme' && <ThemeTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Today's Orders</p>
            <p className="text-3xl font-bold">24</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-3xl font-bold">$1,240</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Orders</p>
            <p className="text-3xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Menu Items</p>
            <p className="text-3xl font-bold">12</p>
          </CardContent>
        </Card>
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
    return <div className="flex justify-center py-12"><Spinner size="lg" label="Loading menu items..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    <Badge variant="secondary">{item.category.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFeatured(item.id, item.isFeatured)}
                    className={item.isFeatured ? 'text-yellow-500' : 'text-muted-foreground'}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleAvailability(item.id, item.isAvailable)}
                    className={item.isAvailable ? 'text-green-500' : 'text-red-500'}
                  >
                    {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
    return <div className="flex justify-center py-12"><Spinner size="lg" label="Loading staff..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="space-y-2">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order Management</h2>
      <p className="text-muted-foreground">
        View and manage all orders. Use the Staff Panel for real-time order updates.
      </p>
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
    return <div className="flex justify-center py-12"><Spinner size="lg" label="Loading notifications..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Manage news tickers and popups</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Notification
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Notification' : 'New Notification'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={form.type === 'ticker' ? 'default' : 'outline'}
                      onClick={() => setForm({ ...form, type: 'ticker' })}
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      Ticker
                    </Button>
                    <Button
                      type="button"
                      variant={form.type === 'popup' ? 'default' : 'outline'}
                      onClick={() => setForm({ ...form, type: 'popup' })}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Popup
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Priority (0-100)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Happy Hour Special!"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Message</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="e.g. 50% off all drinks from 5-7 PM"
                  required
                />
              </div>

              {form.type === 'popup' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Image URL (optional)</label>
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">Link URL (optional)</label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com/promo"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
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
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet. Create your first one!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.type === 'ticker' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {n.type === 'ticker' ? <Megaphone className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{n.title}</h3>
                      <Badge variant={n.type === 'ticker' ? 'info' : 'secondary'} className="text-xs">
                        {n.type}
                      </Badge>
                      <Badge variant={n.isActive ? 'success' : 'outline'} className="text-xs">
                        {n.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(n.id, n.isActive)}
                      className={n.isActive ? 'text-green-500' : 'text-muted-foreground'}
                    >
                      {n.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(n)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(n.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
    return <div className="flex justify-center py-12"><Spinner size="lg" label="Loading reports..." /></div>;
  }

  if (!report) {
    return <div className="text-center py-12 text-muted-foreground">Failed to load reports</div>;
  }

  const { overview, revenueTrend, popularItems, statusDistribution, paymentBreakdown, peakHours } = report;

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...revenueTrend.map((d: { revenue: number }) => d.revenue), 1);
  const maxOrders = Math.max(...peakHours.map((d: { orders: number }) => d.orders), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Track your restaurant performance</p>
        </div>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as ReportPeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(overview.totalRevenue)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{overview.totalOrders.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">{formatPrice(overview.avgOrderValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Customers</p>
                <p className="text-2xl font-bold">{overview.newCustomers.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueTrend.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No revenue data for this period</p>
          ) : (
            <div className="h-64 flex items-end gap-1">
              {revenueTrend.map((point: { date: string; revenue: number }) => (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t-md min-h-[4px] transition-all hover:bg-primary"
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            {popularItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No order data yet</p>
            ) : (
              <div className="space-y-3">
                {popularItems.slice(0, 5).map((item: { menuItem?: { id: string; name: string }; totalQuantity: number; totalRevenue: number }, i: number) => (
                  <div key={item.menuItem?.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.menuItem?.name ?? 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.totalQuantity} sold · {formatPrice(item.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {peakHours.every((h: { hour: number; orders: number }) => h.orders === 0) ? (
              <p className="text-center text-muted-foreground py-8">No order data yet</p>
            ) : (
              <div className="h-48 flex items-end gap-0.5">
                {peakHours.map((point: { hour: number; orders: number }) => (
                  <div key={point.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/60 rounded-t-sm min-h-[2px] hover:bg-primary transition-colors"
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistribution.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {statusDistribution.map((item: { status: string; count: number }) => {
                  const total = statusDistribution.reduce((sum: number, s: { status: string; count: number }) => sum + s.count, 0);
                  const percentage = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{item.status}</span>
                        <span className="text-muted-foreground">{item.count} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentBreakdown.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {paymentBreakdown.map((item: { method: string; count: number; total: number }) => {
                  const total = paymentBreakdown.reduce((sum: number, p: { method: string; count: number; total: number }) => sum + p.total, 0);
                  const percentage = total > 0 ? (item.total / total) * 100 : 0;
                  return (
                    <div key={item.method}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{item.method}</span>
                        <span className="text-muted-foreground">
                          {item.count} orders · {formatPrice(item.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Theme Customization</h2>
      <p className="text-muted-foreground">
        Customize the appearance of your restaurant's ordering system.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Color Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {THEME_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setPrimaryColor(color.value);
                  document.documentElement.className = color.class;
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  primaryColor === color.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-muted'
                }`}
              >
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs font-medium">{color.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Mode</p>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button>Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <div className="flex gap-2">
              <Badge>Default Badge</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
