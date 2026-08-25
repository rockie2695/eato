/**
 * API endpoint functions.
 *
 * Each function wraps an API call and returns typed data.
 * These are used by Zustand stores and directly by components.
 *
 * Usage:
 *   import { authApi, menuApi } from '@eato/shared/api';
 *   const { user, accessToken } = await authApi.login({ email, password });
 */

import type { AxiosInstance } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  User,
  MenuCategory,
  MenuItemWithCategory,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  ReportPeriod,
  ReportData,
  ReportOverview,
  RevenueTrendPoint,
  PopularItem,
  StatusDistribution,
  PaymentBreakdown,
  PeakHour,
  PaginatedResponse,
  ApiResponse,
} from '../types';

// ─── Auth API ──────────────────────────────────────────────────

export function createAuthApi(client: AxiosInstance) {
  return {
    /** Authenticate user with email/password */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
      const res = await client.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        data
      );
      return res.data.data;
    },

    /** Register a new customer account */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      const res = await client.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        data
      );
      return res.data.data;
    },

    /** Refresh access token using refresh token */
    refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
      const res = await client.post<ApiResponse<AuthResponse>>(
        '/auth/refresh',
        data
      );
      return res.data.data;
    },

    /** Get current authenticated user profile */
    me: async (): Promise<User> => {
      const res = await client.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    },

    /** Logout (invalidate refresh token) */
    logout: async (): Promise<void> => {
      await client.post('/auth/logout');
    },
  };
}

// ─── Menu API ──────────────────────────────────────────────────

export function createMenuApi(client: AxiosInstance) {
  return {
    /** Get all active menu categories */
    getCategories: async (): Promise<MenuCategory[]> => {
      const res = await client.get<ApiResponse<MenuCategory[]>>(
        '/menu/categories'
      );
      return res.data.data;
    },

    /** Get menu items, optionally filtered by category */
    getItems: async (params?: {
      categoryId?: string;
      search?: string;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<MenuItemWithCategory>> => {
      const res = await client.get<PaginatedResponse<MenuItemWithCategory>>(
        '/menu/items',
        { params }
      );
      return res.data;
    },

    /** Get a single menu item by ID */
    getItem: async (id: string): Promise<MenuItemWithCategory> => {
      const res = await client.get<ApiResponse<MenuItemWithCategory>>(
        `/menu/items/${id}`
      );
      return res.data.data;
    },

    /** Get featured menu items for homepage */
    getFeatured: async (): Promise<MenuItemWithCategory[]> => {
      const res = await client.get<ApiResponse<MenuItemWithCategory[]>>(
        '/menu/featured'
      );
      return res.data.data;
    },

    /** Update a menu item */
    updateItem: async (
      id: string,
      data: Partial<Pick<MenuItemWithCategory, 'name' | 'description' | 'price' | 'image' | 'categoryId' | 'isAvailable' | 'isFeatured' | 'tags'>>
    ): Promise<MenuItemWithCategory> => {
      const res = await client.put<ApiResponse<MenuItemWithCategory>>(
        `/menu/items/${id}`,
        data
      );
      return res.data.data;
    },
  };
}

// ─── Cart API ──────────────────────────────────────────────────

export function createCartApi(client: AxiosInstance) {
  return {
    /** Get current user's cart */
    getCart: async (): Promise<Cart> => {
      const res = await client.get<ApiResponse<Cart>>('/cart');
      return res.data.data;
    },

    /** Add item to cart */
    addItem: async (data: AddToCartRequest): Promise<Cart> => {
      const res = await client.post<ApiResponse<Cart>>('/cart/items', data);
      return res.data.data;
    },

    /** Update cart item quantity/instructions */
    updateItem: async (
      itemId: string,
      data: UpdateCartItemRequest
    ): Promise<Cart> => {
      const res = await client.put<ApiResponse<Cart>>(
        `/cart/items/${itemId}`,
        data
      );
      return res.data.data;
    },

    /** Remove item from cart */
    removeItem: async (itemId: string): Promise<Cart> => {
      const res = await client.delete<ApiResponse<Cart>>(
        `/cart/items/${itemId}`
      );
      return res.data.data;
    },

    /** Clear entire cart */
    clearCart: async (): Promise<void> => {
      await client.delete('/cart');
    },
  };
}

// ─── Order API ─────────────────────────────────────────────────

export function createOrderApi(client: AxiosInstance) {
  return {
    /** Create a new order */
    create: async (data: CreateOrderRequest): Promise<Order> => {
      const res = await client.post<ApiResponse<Order>>('/orders', data);
      return res.data.data;
    },

    /** Get order by ID */
    getById: async (id: string): Promise<Order> => {
      const res = await client.get<ApiResponse<Order>>(`/orders/${id}`);
      return res.data.data;
    },

    /** Get current user's orders */
    getMyOrders: async (params?: {
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<Order>> => {
      const res = await client.get<PaginatedResponse<Order>>(
        '/orders/my',
        { params }
      );
      return res.data;
    },

    /** Get all orders (staff/admin) */
    getAll: async (params?: {
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<Order>> => {
      const res = await client.get<PaginatedResponse<Order>>('/orders', {
        params,
      });
      return res.data;
    },

    /** Update order status (staff/admin) */
    updateStatus: async (
      id: string,
      data: UpdateOrderStatusRequest
    ): Promise<Order> => {
      const res = await client.patch<ApiResponse<Order>>(
        `/orders/${id}/status`,
        data
      );
      return res.data.data;
    },

    /** Cancel an order (customer) */
    cancel: async (id: string): Promise<Order> => {
      const res = await client.post<ApiResponse<Order>>(
        `/orders/${id}/cancel`
      );
      return res.data.data;
    },
  };
}

// ─── Staff API (Admin/Staff only) ─────────────────────────────

export function createStaffApi(client: AxiosInstance) {
  return {
    /** Get all staff users */
    getStaff: async (): Promise<User[]> => {
      const res = await client.get<ApiResponse<User[]>>('/staff');
      return res.data.data;
    },

    /** Create a new staff account */
    createStaff: async (data: RegisterRequest & { role: string }): Promise<User> => {
      const res = await client.post<ApiResponse<User>>('/staff', data);
      return res.data.data;
    },

    /** Update staff member */
    updateStaff: async (
      id: string,
      data: Partial<User>
    ): Promise<User> => {
      const res = await client.put<ApiResponse<User>>(`/staff/${id}`, data);
      return res.data.data;
    },

    /** Delete staff member */
    deleteStaff: async (id: string): Promise<void> => {
      await client.delete(`/staff/${id}`);
    },
  };
}

// ─── Notification API ────────────────────────────────────────

export function createNotificationApi(client: AxiosInstance) {
  return {
    /** Get active notifications (public, for users) */
    getActive: async (type?: 'ticker' | 'popup'): Promise<Notification[]> => {
      const params = type ? { type } : {};
      const res = await client.get<ApiResponse<Notification[]>>(
        '/notifications/active',
        { params }
      );
      return res.data.data;
    },

    /** Get all notifications (admin) */
    getAll: async (params?: {
      type?: 'ticker' | 'popup';
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<Notification>> => {
      const res = await client.get<PaginatedResponse<Notification>>(
        '/notifications',
        { params }
      );
      return res.data;
    },

    /** Get notification by ID (admin) */
    getById: async (id: string): Promise<Notification> => {
      const res = await client.get<ApiResponse<Notification>>(
        `/notifications/${id}`
      );
      return res.data.data;
    },

    /** Create notification (admin) */
    create: async (data: CreateNotificationRequest): Promise<Notification> => {
      const res = await client.post<ApiResponse<Notification>>(
        '/notifications',
        data
      );
      return res.data.data;
    },

    /** Update notification (admin) */
    update: async (
      id: string,
      data: UpdateNotificationRequest
    ): Promise<Notification> => {
      const res = await client.put<ApiResponse<Notification>>(
        `/notifications/${id}`,
        data
      );
      return res.data.data;
    },

    /** Delete notification (admin) */
    delete: async (id: string): Promise<void> => {
      await client.delete(`/notifications/${id}`);
    },
  };
}

// ─── Analytics API ────────────────────────────────────────────

export function createAnalyticsApi(client: AxiosInstance) {
  return {
    /** Get full report for a period (admin) */
    getReport: async (period: ReportPeriod = 'monthly'): Promise<ReportData> => {
      const res = await client.get<ApiResponse<ReportData>>('/analytics/report', {
        params: { period },
      });
      return res.data.data;
    },

    /** Get overview stats (admin) */
    getOverview: async (period: ReportPeriod = 'monthly'): Promise<ReportOverview> => {
      const res = await client.get<ApiResponse<ReportOverview>>('/analytics/overview', {
        params: { period },
      });
      return res.data.data;
    },

    /** Get revenue trend (admin) */
    getRevenueTrend: async (period: ReportPeriod = 'monthly'): Promise<RevenueTrendPoint[]> => {
      const res = await client.get<ApiResponse<RevenueTrendPoint[]>>('/analytics/revenue-trend', {
        params: { period },
      });
      return res.data.data;
    },

    /** Get popular items (admin) */
    getPopularItems: async (limit: number = 10): Promise<PopularItem[]> => {
      const res = await client.get<ApiResponse<PopularItem[]>>('/analytics/popular-items', {
        params: { limit },
      });
      return res.data.data;
    },

    /** Get order status distribution (admin) */
    getStatusDistribution: async (period: ReportPeriod = 'monthly'): Promise<StatusDistribution[]> => {
      const res = await client.get<ApiResponse<StatusDistribution[]>>('/analytics/status-dist', {
        params: { period },
      });
      return res.data.data;
    },

    /** Get payment method breakdown (admin) */
    getPaymentBreakdown: async (period: ReportPeriod = 'monthly'): Promise<PaymentBreakdown[]> => {
      const res = await client.get<ApiResponse<PaymentBreakdown[]>>('/analytics/payment-dist', {
        params: { period },
      });
      return res.data.data;
    },

    /** Get peak hours (admin) */
    getPeakHours: async (period: ReportPeriod = 'monthly'): Promise<PeakHour[]> => {
      const res = await client.get<ApiResponse<PeakHour[]>>('/analytics/peak-hours', {
        params: { period },
      });
      return res.data.data;
    },
  };
}
