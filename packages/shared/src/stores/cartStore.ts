/**
 * Cart Store (Zustand)
 *
 * Manages shopping cart state with optimistic updates.
 * Syncs with backend API for persistence across devices.
 *
 * Usage:
 *   const { items, totalAmount, addItem, removeItem } = useCartStore();
 */

import { create } from 'zustand';
import type { CartItem, MenuItem } from '../types';
import type { StorageAdapter } from '../api/client';
import { calculateCartTotal, calculateItemCount } from '../utils';
import { STORAGE_KEYS } from '../constants';

interface CartState {
  /** Items currently in the cart */
  items: CartItem[];
  /** Total amount in cents */
  totalAmount: number;
  /** Total number of items */
  itemCount: number;
  /** Whether a sync operation is in progress */
  isLoading: boolean;
  /** Error message from last operation */
  error: string | null;
  /** Table number associated with this cart */
  tableNumber: number | null;
}

interface CartActions {
  /** Load cart from local storage */
  loadCart: () => Promise<void>;
  /** Add an item to the cart */
  addItem: (menuItem: MenuItem, quantity?: number, instructions?: string) => void;
  /** Update quantity of an existing cart item */
  updateQuantity: (itemId: string, quantity: number) => void;
  /** Update special instructions for a cart item */
  updateInstructions: (itemId: string, instructions: string) => void;
  /** Remove an item from the cart */
  removeItem: (itemId: string) => void;
  /** Clear all items from the cart */
  clearCart: () => void;
  /** Set table number (for dine-in orders) */
  setTableNumber: (tableNumber: number | null) => void;
  /** Clear error message */
  clearError: () => void;
}

export type CartStore = CartState & CartActions;

/**
 * Create the cart store.
 * Cart is persisted locally and optionally synced with backend.
 */
export function createCartStore(storage: StorageAdapter) {
  return create<CartStore>((set, get) => ({
    // ── State ────────────────────────────────────────────────
    items: [],
    totalAmount: 0,
    itemCount: 0,
    isLoading: false,
    error: null,
    tableNumber: null,

    // ── Actions ──────────────────────────────────────────────

    /**
     * Load cart from local storage on app start.
     */
    loadCart: async () => {
      try {
        const cartJson = await storage.getItem(STORAGE_KEYS.USER + '_cart');
        if (cartJson) {
          const { items, tableNumber } = JSON.parse(cartJson);
          const totalAmount = calculateCartTotal(items);
          const itemCount = calculateItemCount(items);
          set({ items, totalAmount, itemCount, tableNumber });
        }
      } catch {
        // Corrupted cart data - start fresh
        set({ items: [], totalAmount: 0, itemCount: 0 });
      }
    },

    /**
     * Add an item to the cart.
     * If the item already exists, increment its quantity.
     */
    addItem: (menuItem, quantity = 1, instructions) => {
      const { items } = get();

      // Check if item already in cart
      const existingIndex = items.findIndex(
        (item) => item.menuItemId === menuItem.id
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Update existing item
        newItems = items.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
                specialInstructions: instructions || item.specialInstructions,
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          menuItemId: menuItem.id,
          quantity,
          price: menuItem.price,
          specialInstructions: instructions,
          menuItem,
        };
        newItems = [...items, newItem];
      }

      const totalAmount = calculateCartTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      set({ items: newItems, totalAmount, itemCount });
      get()._persistCart();
    },

    /**
     * Update quantity of a cart item.
     * If quantity is 0, remove the item.
     */
    updateQuantity: (itemId, quantity) => {
      if (quantity <= 0) {
        get().removeItem(itemId);
        return;
      }

      const { items } = get();
      const newItems = items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      const totalAmount = calculateCartTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      set({ items: newItems, totalAmount, itemCount });
      get()._persistCart();
    },

    /** Update special instructions for a cart item */
    updateInstructions: (itemId, instructions) => {
      const { items } = get();
      const newItems = items.map((item) =>
        item.id === itemId
          ? { ...item, specialInstructions: instructions }
          : item
      );
      set({ items: newItems });
      get()._persistCart();
    },

    /** Remove an item from the cart */
    removeItem: (itemId) => {
      const { items } = get();
      const newItems = items.filter((item) => item.id !== itemId);
      const totalAmount = calculateCartTotal(newItems);
      const itemCount = calculateItemCount(newItems);

      set({ items: newItems, totalAmount, itemCount });
      get()._persistCart();
    },

    /** Clear all items from the cart */
    clearCart: () => {
      set({ items: [], totalAmount: 0, itemCount: 0 });
      get()._persistCart();
    },

    /** Set table number for dine-in orders */
    setTableNumber: (tableNumber) => {
      set({ tableNumber });
      get()._persistCart();
    },

    /** Clear error message */
    clearError: () => set({ error: null }),

    // ── Private Helpers ──────────────────────────────────────

    /** Persist cart to local storage */
    _persistCart: async () => {
      const { items, tableNumber } = get();
      await storage.setItem(
        STORAGE_KEYS.USER + '_cart',
        JSON.stringify({ items, tableNumber })
      );
    },
  }));
}
