/**
 * Application-wide constants and enumerations.
 * Used by both Web and Mobile to ensure consistent behavior.
 */

import type { OrderStatus, PaymentMethod, PaymentStatus, UserRole } from '../types';

// ─── Order Status Config ───────────────────────────────────────

/** Maps order status to display info (label, color, icon) */
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'clock',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'check-circle',
  },
  preparing: {
    label: 'Preparing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'utensils',
  },
  ready: {
    label: 'Ready',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'bell',
  },
  served: {
    label: 'Served',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'user-check',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: 'check',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'x-circle',
  },
};

// ─── Payment Constants ─────────────────────────────────────────

export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  cash: { label: 'Cash', icon: 'banknote' },
  online: { label: 'Online Payment', icon: 'credit-card' },
  card: { label: 'Card', icon: 'credit-card' },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'text-yellow-600' },
  paid: { label: 'Paid', color: 'text-green-600' },
  failed: { label: 'Failed', color: 'text-red-600' },
  refunded: { label: 'Refunded', color: 'text-gray-600' },
};

// ─── User Roles ────────────────────────────────────────────────

export const USER_ROLE_CONFIG: Record<
  UserRole,
  { label: string; description: string }
> = {
  customer: { label: 'Customer', description: 'Regular diner' },
  staff: { label: 'Staff', description: 'Waiter / Server' },
  kitchen: { label: 'Kitchen', description: 'Kitchen staff' },
  admin: { label: 'Admin', description: 'System administrator' },
};

// ─── API Configuration ─────────────────────────────────────────

/** Default API base URL (overridden by env vars) */
export const API_BASE_URL = 'http://localhost:5000/api/v1';

/** API request timeout in milliseconds */
export const API_TIMEOUT = 30_000;

/** Token storage keys */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'eato_access_token',
  REFRESH_TOKEN: 'eato_refresh_token',
  USER: 'eato_user',
  THEME: 'eato_theme',
} as const;

// ─── Pagination ────────────────────────────────────────────────

/** Default page size for paginated API calls */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum items per page */
export const MAX_PAGE_SIZE = 100;

// ─── Validation ────────────────────────────────────────────────

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 8;

/** Phone number regex (international format) */
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/** Email regex */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Timeouts & Intervals ─────────────────────────────────────

/** Socket reconnection delay in ms */
export const SOCKET_RECONNECT_DELAY = 3000;

/** Cart auto-sync interval in ms */
export const CART_SYNC_INTERVAL = 30_000;

/** Refresh token threshold in ms (5 minutes before expiry) */
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;
