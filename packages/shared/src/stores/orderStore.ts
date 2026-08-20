/**
 * Order Store (Zustand)
 *
 * Manages order state, history, and real-time status updates.
 * Works with Socket.io for live order tracking.
 *
 * Usage:
 *   const { currentOrder, orders, createOrder } = useOrderStore();
 */

import { create } from 'zustand';
import type { Order, CreateOrderRequest } from '../types';

interface OrderState {
  /** The order currently being tracked */
  currentOrder: Order | null;
  /** User's order history */
  orders: Order[];
  /** All orders (staff/admin view) */
  allOrders: Order[];
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Total pages available for pagination */
  totalPages: number;
}

interface OrderActions {
  /** Create a new order */
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  /** Load current user's orders */
  loadMyOrders: (params?: { status?: string; page?: number }) => Promise<void>;
  /** Load all orders (staff/admin) */
  loadAllOrders: (params?: {
    status?: string;
    page?: number;
  }) => Promise<void>;
  /** Get order by ID */
  getOrder: (id: string) => Promise<Order>;
  /** Update order status (from Socket.io event) */
  updateOrderStatus: (orderId: string, status: string) => void;
  /** Set the currently tracked order */
  setCurrentOrder: (order: Order | null) => void;
  /** Clear error */
  clearError: () => void;
}

export type OrderStore = OrderState & OrderActions;

/**
 * Create the order store.
 * @param api - Order API instance
 */
export function createOrderStore(api: {
  create: (data: CreateOrderRequest) => Promise<Order>;
  getMyOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<{ data: Order[]; totalPages: number }>;
  getAll: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<{ data: Order[]; totalPages: number }>;
  getById: (id: string) => Promise<Order>;
}) {
  return create<OrderStore>((set, get) => ({
    // ── State ────────────────────────────────────────────────
    currentOrder: null,
    orders: [],
    allOrders: [],
    isLoading: false,
    error: null,
    totalPages: 1,

    // ── Actions ──────────────────────────────────────────────

    /**
     * Create a new order.
     * Clears the cart on success (handled by caller).
     */
    createOrder: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const order = await api.create(data);
        set({
          currentOrder: order,
          isLoading: false,
          orders: [order, ...get().orders],
        });
        return order;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create order';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    /** Load current user's orders with pagination */
    loadMyOrders: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const result = await api.getMyOrders({
          ...params,
          limit: 10,
        });
        set({
          orders: result.data,
          totalPages: result.totalPages,
          isLoading: false,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load orders';
        set({ error: message, isLoading: false });
      }
    },

    /** Load all orders (for staff/kitchen dashboard) */
    loadAllOrders: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const result = await api.getAll({
          ...params,
          limit: 20,
        });
        set({
          allOrders: result.data,
          totalPages: result.totalPages,
          isLoading: false,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load orders';
        set({ error: message, isLoading: false });
      }
    },

    /** Fetch a single order by ID */
    getOrder: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const order = await api.getById(id);
        set({ currentOrder: order, isLoading: false });
        return order;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load order';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    /**
     * Update order status from real-time Socket.io event.
     * Updates both current order and orders list.
     */
    updateOrderStatus: (orderId, status) => {
      const { currentOrder, orders, allOrders } = get();

      // Update current order if it matches
      if (currentOrder?.id === orderId) {
        set({
          currentOrder: { ...currentOrder, status: status as Order['status'] },
        });
      }

      // Update in orders list
      const updatedOrders = orders.map((o) =>
        o.id === orderId ? { ...o, status: status as Order['status'] } : o
      );
      set({ orders: updatedOrders });

      // Update in allOrders list (staff view)
      const updatedAllOrders = allOrders.map((o) =>
        o.id === orderId ? { ...o, status: status as Order['status'] } : o
      );
      set({ allOrders: updatedAllOrders });
    },

    /** Set the currently tracked order */
    setCurrentOrder: (order) => set({ currentOrder: order }),

    /** Clear error message */
    clearError: () => set({ error: null }),
  }));
}
