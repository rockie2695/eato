/**
 * Tests for Zustand stores.
 *
 * Tests store creation, state management, and actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthStore } from '../stores/authStore';
import { createCartStore } from '../stores/cartStore';
import { createOrderStore } from '../stores/orderStore';
import { createThemeStore } from '../stores/themeStore';
import type { StorageAdapter } from '../api/client';

// ─── Mock Storage Adapter ──────────────────────────────────────

function createMockStorage(): StorageAdapter & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: async (key) => store[key] || null,
    setItem: async (key, value) => { store[key] = value; },
    removeItem: async (key) => { delete store[key]; },
  };
}

// ─── Auth Store Tests ──────────────────────────────────────────

describe('AuthStore', () => {
  let storage: ReturnType<typeof createMockStorage>;
  let mockApi: {
    login: any;
    register: any;
    me: any;
  };

  beforeEach(() => {
    storage = createMockStorage();
    mockApi = {
      login: vi.fn(),
      register: vi.fn(),
      me: vi.fn(),
    };
  });

  it('creates store with default state', () => {
    const useAuthStore = createAuthStore(storage, mockApi);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login sets user and tokens', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test', role: 'customer' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockApi.login.mockResolvedValue({
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const useAuthStore = createAuthStore(storage, mockApi);
    await useAuthStore.getState().login({ email: 'test@test.com', password: 'pass' });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.isLoading).toBe(false);
  });

  it('login handles errors', async () => {
    mockApi.login.mockRejectedValue(new Error('Invalid credentials'));

    const useAuthStore = createAuthStore(storage, mockApi);
    await expect(
      useAuthStore.getState().login({ email: 'test@test.com', password: 'wrong' })
    ).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.error).toBe('Invalid credentials');
    expect(state.isLoading).toBe(false);
  });

  it('logout clears state', async () => {
    const useAuthStore = createAuthStore(storage, mockApi);
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('clearError clears error message', async () => {
    const useAuthStore = createAuthStore(storage, mockApi);
    mockApi.login.mockRejectedValue(new Error('Error'));

    try {
      await useAuthStore.getState().login({ email: 'test@test.com', password: 'wrong' });
    } catch {
      // Expected
    }

    expect(useAuthStore.getState().error).toBeTruthy();
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});

// ─── Cart Store Tests ──────────────────────────────────────────

describe('CartStore', () => {
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('creates store with empty cart', () => {
    const useCartStore = createCartStore(storage);
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalAmount).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  it('adds item to cart', () => {
    const useCartStore = createCartStore(storage);
    const menuItem = {
      id: 'item-1',
      name: 'Test Item',
      price: 1000,
      categoryId: 'cat-1',
      isAvailable: true,
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useCartStore.getState().addItem(menuItem, 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.items[0].price).toBe(1000);
    expect(state.totalAmount).toBe(2000);
    expect(state.itemCount).toBe(2);
  });

  it('increments quantity for existing item', () => {
    const useCartStore = createCartStore(storage);
    const menuItem = {
      id: 'item-1',
      name: 'Test Item',
      price: 1000,
      categoryId: 'cat-1',
      isAvailable: true,
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useCartStore.getState().addItem(menuItem, 1);
    useCartStore.getState().addItem(menuItem, 1);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('removes item from cart', () => {
    const useCartStore = createCartStore(storage);
    const menuItem = {
      id: 'item-1',
      name: 'Test Item',
      price: 1000,
      categoryId: 'cat-1',
      isAvailable: true,
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useCartStore.getState().addItem(menuItem, 1);
    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(itemId);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalAmount).toBe(0);
  });

  it('updates quantity', () => {
    const useCartStore = createCartStore(storage);
    const menuItem = {
      id: 'item-1',
      name: 'Test Item',
      price: 1000,
      categoryId: 'cat-1',
      isAvailable: true,
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useCartStore.getState().addItem(menuItem, 1);
    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateQuantity(itemId, 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalAmount).toBe(5000);
  });

  it('clears cart', () => {
    const useCartStore = createCartStore(storage);
    const menuItem = {
      id: 'item-1',
      name: 'Test Item',
      price: 1000,
      categoryId: 'cat-1',
      isAvailable: true,
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useCartStore.getState().addItem(menuItem, 2);
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalAmount).toBe(0);
  });

  it('persists cart to storage', async () => {
    const useCartStore = createCartStore(storage);
    const menuItem = {
      id: 'item-1',
      name: 'Test Item',
      price: 1000,
      categoryId: 'cat-1',
      isAvailable: true,
      isFeatured: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useCartStore.getState().addItem(menuItem, 1);

    // Check storage
    const stored = await storage.getItem('eato_user_cart');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.items).toHaveLength(1);
  });
});

// ─── Order Store Tests ─────────────────────────────────────────

describe('OrderStore', () => {
  let mockApi: {
    create: any;
    getMyOrders: any;
    getAll: any;
    getById: any;
  };

  beforeEach(() => {
    mockApi = {
      create: vi.fn(),
      getMyOrders: vi.fn(),
      getAll: vi.fn(),
      getById: vi.fn(),
    };
  });

  it('creates store with default state', () => {
    const useOrderStore = createOrderStore(mockApi);
    const state = useOrderStore.getState();
    expect(state.currentOrder).toBeNull();
    expect(state.orders).toEqual([]);
    expect(state.allOrders).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('createOrder sets current order', async () => {
    const mockOrder = {
      id: 'order-1',
      status: 'pending',
      totalAmount: 2000,
      items: [],
    };
    mockApi.create.mockResolvedValue(mockOrder);

    const useOrderStore = createOrderStore(mockApi);
    const order = await useOrderStore.getState().createOrder({
      paymentMethod: 'cash',
      items: [{ menuItemId: 'item-1', quantity: 2 }],
    });

    expect(order).toEqual(mockOrder);
    expect(useOrderStore.getState().currentOrder).toEqual(mockOrder);
  });

  it('updateOrderStatus updates order in list', () => {
    const useOrderStore = createOrderStore(mockApi);
    useOrderStore.setState({
      orders: [{ id: 'order-1', status: 'pending' } as any],
    });

    useOrderStore.getState().updateOrderStatus('order-1', 'confirmed');

    const state = useOrderStore.getState();
    expect(state.orders[0].status).toBe('confirmed');
  });
});

// ─── Theme Store Tests ─────────────────────────────────────────

describe('ThemeStore', () => {
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('creates store with default theme', () => {
    const useThemeStore = createThemeStore(storage);
    const state = useThemeStore.getState();
    expect(state.theme).toBe('system');
    expect(state.primaryColor).toBe('#ea580c');
    expect(state.borderRadius).toBe('medium');
  });

  it('setTheme updates theme', () => {
    const useThemeStore = createThemeStore(storage);
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('setPrimaryColor updates color', () => {
    const useThemeStore = createThemeStore(storage);
    useThemeStore.getState().setPrimaryColor('#2563eb');
    expect(useThemeStore.getState().primaryColor).toBe('#2563eb');
  });

  it('setBorderRadius updates radius', () => {
    const useThemeStore = createThemeStore(storage);
    useThemeStore.getState().setBorderRadius('large');
    expect(useThemeStore.getState().borderRadius).toBe('large');
  });
});
