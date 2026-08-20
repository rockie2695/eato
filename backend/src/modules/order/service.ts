/**
 * Order Service.
 *
 * Handles order creation, status management, and history.
 * Integrates with Stripe for online payments.
 * Emits Socket.io events for real-time updates.
 */

import { prisma } from '../../config/database.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { createCheckoutSession } from '../../config/stripe.js';
import type { OrderStatus } from '@prisma/client';

interface CreateOrderInput {
  userId: string;
  tableNumber?: number;
  paymentMethod: 'cash' | 'online' | 'card';
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
}

/**
 * Create a new order.
 * For online payments, creates a Stripe Checkout Session.
 */
export async function createOrder(
  input: CreateOrderInput,
  io?: { emit: (event: string, data: unknown) => void }
) {
  const { userId, tableNumber, paymentMethod, notes, items } = input;

  // Fetch menu items to get current prices
  const menuItemIds = items.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  if (menuItems.length !== menuItemIds.length) {
    throw new ApiError('One or more menu items not found', 400, 'INVALID_ITEMS');
  }

  // Check availability
  const unavailable = menuItems.filter((item) => !item.isAvailable);
  if (unavailable.length > 0) {
    throw new ApiError(
      `Items unavailable: ${unavailable.map((i) => i.name).join(', ')}`,
      400,
      'ITEMS_UNAVAILABLE'
    );
  }

  // Calculate total
  const totalAmount = items.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    return sum + (menuItem?.price || 0) * item.quantity;
  }, 0);

  // Create order in database
  const order = await prisma.order.create({
    data: {
      userId,
      tableNumber,
      paymentMethod,
      totalAmount,
      notes,
      items: {
        create: items.map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId);
          return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItem?.price || 0,
            specialInstructions: item.specialInstructions,
          };
        }),
      },
    },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  // Handle online payment with Stripe
  let stripeSessionId: string | null = null;
  if (paymentMethod === 'online') {
    const session = await createCheckoutSession(
      order.id,
      totalAmount,
      items.map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        return {
          name: menuItem?.name || 'Menu Item',
          quantity: item.quantity,
          price: menuItem?.price || 0,
        };
      })
    );
    stripeSessionId = session.id;

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId },
    });
  }

  // Clear user's cart
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // Emit Socket.io event for new order
  io?.emit('order:new', { order });

  return {
    ...order,
    stripeSessionId,
  };
}

/**
 * Get order by ID.
 */
export async function getOrderById(id: string, userId?: string) {
  const where: Record<string, unknown> = { id };
  if (userId) {
    where.userId = userId; // Ensure user can only see their own orders
  }

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  if (!order) {
    throw new ApiError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  return order;
}

/**
 * Get current user's orders.
 */
export async function getMyOrders(
  userId: string,
  params: { status?: string; page?: number; limit?: number }
) {
  const { status, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get all orders (staff/admin view).
 */
export async function getAllOrders(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { status, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menuItem: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Update order status.
 * Emits Socket.io event for real-time updates.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  io?: { emit: (event: string, data: unknown) => void }
) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new ApiError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready'],
    ready: ['served'],
    served: ['completed'],
  };

  const allowed = validTransitions[order.status];
  if (allowed && !allowed.includes(status)) {
    throw new ApiError(
      `Cannot transition from ${order.status} to ${status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  // Emit Socket.io event for status update
  io?.emit('order:statusUpdate', {
    orderId: id,
    status,
    updatedAt: new Date().toISOString(),
  });

  return updatedOrder;
}

/**
 * Cancel an order (customer only, before confirmed).
 */
export async function cancelOrder(id: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    throw new ApiError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  if (order.userId !== userId) {
    throw new ApiError('Unauthorized', 403, 'FORBIDDEN');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(
      'Order cannot be cancelled at this stage',
      400,
      'CANNOT_CANCEL'
    );
  }

  return prisma.order.update({
    where: { id },
    data: { status: 'cancelled' },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });
}
