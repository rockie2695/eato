/**
 * Notification Service.
 *
 * Manages news ticker and popup notifications.
 * Admins create/manage; users see active ones.
 */

import { prisma } from '../../config/database.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../../config/redis.js';
import { ApiError } from '../../middleware/errorHandler.js';

const CACHE_TTL = 120; // 2 minutes
const CACHE_PREFIX = 'notif';

/**
 * Get all active notifications for users.
 * Filters by type, active status, and date range.
 */
export async function getActive(type?: 'ticker' | 'popup') {
  const cacheKey = `${CACHE_PREFIX}:active:${type || 'all'}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const where: Record<string, unknown> = {
    isActive: true,
    OR: [
      { startsAt: null },
      { startsAt: { lte: now } },
    ],
    AND: [
      {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    ],
  };

  if (type) {
    where.type = type;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  await cacheSet(cacheKey, notifications, CACHE_TTL);
  return notifications;
}

/**
 * Get all notifications (admin view, including inactive).
 */
export async function getAll(params?: { type?: 'ticker' | 'popup'; page?: number; limit?: number }) {
  const { type, page = 1, limit = 50 } = params || {};
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single notification by ID.
 */
export async function getById(id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) {
    throw new ApiError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }
  return notification;
}

/**
 * Create a new notification (admin only).
 */
export async function create(data: {
  type: 'ticker' | 'popup';
  title: string;
  message: string;
  image?: string;
  link?: string;
  isActive?: boolean;
  priority?: number;
  startsAt?: string;
  expiresAt?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
  });

  await invalidateCache();
  return notification;
}

/**
 * Update a notification (admin only).
 */
export async function update(
  id: string,
  data: Partial<{
    type: 'ticker' | 'popup';
    title: string;
    message: string;
    image: string | null;
    link: string | null;
    isActive: boolean;
    priority: number;
    startsAt: string | null;
    expiresAt: string | null;
  }>
) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.startsAt !== undefined) {
    updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
  }
  if (data.expiresAt !== undefined) {
    updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: updateData,
  });

  await invalidateCache();
  return notification;
}

/**
 * Delete a notification (admin only).
 */
export async function remove(id: string) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  await prisma.notification.delete({ where: { id } });
  await invalidateCache();
}

/** Invalidate all notification cache entries */
async function invalidateCache() {
  await cacheDelPattern(`${CACHE_PREFIX}:*`);
}
