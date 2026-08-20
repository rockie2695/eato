/**
 * Shared type definitions for the Eato ordering system.
 * These types mirror the Prisma schema and define the API contract
 * between frontend (Web/Mobile) and backend.
 */

// ─── User & Auth ───────────────────────────────────────────────

/** User roles in the system */
export type UserRole = 'customer' | 'staff' | 'kitchen' | 'admin';

/** User entity from the database */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Register request payload */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/** Auth response containing tokens and user data */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** Token refresh request */
export interface RefreshRequest {
  refreshToken: string;
}

// ─── Menu ──────────────────────────────────────────────────────

/** Menu category (e.g., Appetizers, Main Course, Drinks) */
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

/** Individual menu item */
export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  preparationTime?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

/** Menu item with category info populated */
export interface MenuItemWithCategory extends MenuItem {
  category: MenuCategory;
}

// ─── Cart ──────────────────────────────────────────────────────

/** A single item in the shopping cart */
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  menuItem?: MenuItem;
}

/** Full cart state */
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
}

/** Add to cart request */
export interface AddToCartRequest {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

/** Update cart item request */
export interface UpdateCartItemRequest {
  quantity: number;
  specialInstructions?: string;
}

// ─── Order ─────────────────────────────────────────────────────

/** Order status progression */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

/** Payment method options */
export type PaymentMethod = 'cash' | 'online' | 'card';

/** Payment status tracking */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** A customer order */
export interface Order {
  id: string;
  userId: string;
  tableNumber?: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/** Individual item within an order */
export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  menuItem?: MenuItem;
}

/** Create order request */
export interface CreateOrderRequest {
  tableNumber?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
}

/** Order status update request (for staff) */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ─── Table ─────────────────────────────────────────────────────

/** Restaurant table */
export interface Table {
  id: string;
  number: number;
  capacity: number;
  isOccupied: boolean;
  qrCode?: string;
}

// ─── API Response Wrappers ─────────────────────────────────────

/** Standard API error response */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

/** Standard paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Standard API success response */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ─── Notification ──────────────────────────────────────────────

/** Notification type: ticker (scrolling banner) or popup (modal dialog) */
export type NotificationType = 'ticker' | 'popup';

/** A notification created by admin */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  link?: string;
  isActive: boolean;
  priority: number;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Create notification request */
export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  link?: string;
  isActive?: boolean;
  priority?: number;
  startsAt?: string;
  expiresAt?: string;
}

/** Update notification request */
export type UpdateNotificationRequest = Partial<CreateNotificationRequest>;

// ─── Analytics / Reports ───────────────────────────────────────

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface ReportDateRange {
  start: string;
  end: string;
}

export interface ReportOverview {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  newCustomers: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface PopularMenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface PopularItem {
  menuItem: PopularMenuItem;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  total: number;
}

export interface PeakHour {
  hour: number;
  orders: number;
}

export interface ReportData {
  overview: ReportOverview;
  revenueTrend: RevenueTrendPoint[];
  popularItems: PopularItem[];
  statusDistribution: StatusDistribution[];
  paymentBreakdown: PaymentBreakdown[];
  peakHours: PeakHour[];
}

// ─── Socket Events ─────────────────────────────────────────────

/** Real-time order update event */
export interface OrderUpdateEvent {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}

/** New order event (for kitchen/staff) */
export interface NewOrderEvent {
  order: Order;
}
