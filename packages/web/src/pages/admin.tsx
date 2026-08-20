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
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useThemeStore } from '@/stores';
import { menuApi, staffApi } from '@/lib/api';
import { formatPrice } from '@eato/shared/utils';
import type { MenuItemWithCategory, User } from '@eato/shared/types';

type AdminTab = 'overview' | 'menu' | 'staff' | 'orders' | 'theme';

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
