/**
 * Menu Service.
 *
 * Handles menu CRUD operations with Redis caching.
 * Menu data is cached to reduce database queries.
 */

import { prisma } from '../../config/database.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../../config/redis.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MENU_CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'menu';

/**
 * Get all active menu categories.
 * Cached in Redis for 5 minutes.
 */
export async function getCategories() {
  const cached = await cacheGet(`${CACHE_PREFIX}:categories`);
  if (cached) return cached;

  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  await cacheSet(`${CACHE_PREFIX}:categories`, categories, MENU_CACHE_TTL);
  return categories;
}

/**
 * Get menu items with pagination and optional filters.
 */
export async function getItems(params: {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { categoryId, search, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isAvailable: true,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.menuItem.count({ where }),
  ]);

  return {
    data: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single menu item by ID.
 */
export async function getItemById(id: string) {
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!item) {
    throw new ApiError('Menu item not found', 404, 'ITEM_NOT_FOUND');
  }

  return item;
}

/**
 * Get featured menu items for homepage display.
 */
export async function getFeatured() {
  const cached = await cacheGet(`${CACHE_PREFIX}:featured`);
  if (cached) return cached;

  const items = await prisma.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: true },
    take: 10,
    orderBy: { name: 'asc' },
  });

  await cacheSet(`${CACHE_PREFIX}:featured`, items, MENU_CACHE_TTL);
  return items;
}

/**
 * Create a new menu category (admin only).
 */
export async function createCategory(data: {
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}) {
  const category = await prisma.menuCategory.create({ data });
  await invalidateMenuCache();
  return category;
}

/**
 * Create a new menu item (admin only).
 */
export async function createItem(data: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  preparationTime?: number;
}) {
  // Verify category exists
  const category = await prisma.menuCategory.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    throw new ApiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  const item = await prisma.menuItem.create({
    data,
    include: { category: true },
  });

  await invalidateMenuCache();
  return item;
}

/**
 * Update a menu item (admin only).
 */
export async function updateItem(
  id: string,
  data: Partial<{
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    isFeatured: boolean;
    tags: string[];
    preparationTime: number;
  }>
) {
  const item = await prisma.menuItem.update({
    where: { id },
    data,
    include: { category: true },
  });

  await invalidateMenuCache();
  return item;
}

/**
 * Delete a menu item (admin only).
 */
export async function deleteItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
  await invalidateMenuCache();
}

/** Invalidate all menu-related cache entries */
async function invalidateMenuCache() {
  await cacheDelPattern(`${CACHE_PREFIX}:*`);
}
