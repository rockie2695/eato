/**
 * Cart Service.
 *
 * Manages shopping cart operations with Redis caching.
 * Cart data is ephemeral and stored in Redis for fast access.
 */

import { prisma } from '../../config/database.js';
import { cacheGet, cacheSet, cacheDel } from '../../config/redis.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CART_CACHE_TTL = 86400; // 24 hours
const CACHE_PREFIX = 'cart';

/**
 * Get user's cart with items.
 * Tries Redis cache first, falls back to database.
 */
export async function getCart(userId: string) {
  // Try cache first
  const cached = await cacheGet(`${CACHE_PREFIX}:${userId}`);
  if (cached) return cached;

  // Fetch from database
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  const cartData = formatCart(cart);
  await cacheSet(`${CACHE_PREFIX}:${userId}`, cartData, CART_CACHE_TTL);
  return cartData;
}

/**
 * Add an item to the cart.
 * If item already exists, increments quantity.
 */
export async function addItem(
  userId: string,
  menuItemId: string,
  quantity: number,
  specialInstructions?: string
) {
  // Verify menu item exists and is available
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  });

  if (!menuItem) {
    throw new ApiError('Menu item not found', 404, 'ITEM_NOT_FOUND');
  }

  if (!menuItem.isAvailable) {
    throw new ApiError('Menu item is not available', 400, 'ITEM_UNAVAILABLE');
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, menuItemId },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        specialInstructions: specialInstructions || existingItem.specialInstructions,
      },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId,
        quantity,
        specialInstructions,
      },
    });
  }

  // Invalidate cache and return updated cart
  await cacheDel(`${CACHE_PREFIX}:${userId}`);
  return getCart(userId);
}

/**
 * Update cart item quantity.
 */
export async function updateItem(
  userId: string,
  itemId: string,
  quantity: number,
  specialInstructions?: string
) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new ApiError('Cart not found', 404, 'CART_NOT_FOUND');
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw new ApiError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity, specialInstructions },
  });

  await cacheDel(`${CACHE_PREFIX}:${userId}`);
  return getCart(userId);
}

/**
 * Remove an item from the cart.
 */
export async function removeItem(userId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new ApiError('Cart not found', 404, 'CART_NOT_FOUND');
  }

  await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });

  await cacheDel(`${CACHE_PREFIX}:${userId}`);
  return getCart(userId);
}

/**
 * Clear all items from the cart.
 */
export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await cacheDel(`${CACHE_PREFIX}:${userId}`);
}

/**
 * Format cart data for API response.
 */
function formatCart(cart: {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    price: number;
    specialInstructions: string | null;
    menuItem: {
      id: string;
      name: string;
      price: number;
      image: string | null;
    };
  }>;
  updatedAt: Date;
}) {
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.menuItem.price,
      specialInstructions: item.specialInstructions,
      menuItem: item.menuItem,
    })),
    totalAmount,
    itemCount,
    updatedAt: cart.updatedAt.toISOString(),
  };
}
