/**
 * Analytics Service.
 *
 * Provides report data for the admin dashboard.
 * Supports daily, weekly, and monthly aggregations.
 */

import { prisma } from '../../config/database.js';

export type Period = 'daily' | 'weekly' | 'monthly';

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get date range for a period.
 */
function getDateRange(period: Period, referenceDate: Date = new Date()): DateRange {
  const end = new Date(referenceDate);
  const start = new Date(referenceDate);

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Get overview stats for a period.
 */
export async function getOverview(period: Period) {
  const { start, end } = getDateRange(period);

  const [orders, revenue, customers] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'cancelled' },
      },
      _count: true,
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'cancelled' },
        paymentStatus: 'paid',
      },
      _sum: { totalAmount: true },
    }),
    prisma.user.aggregate({
      where: {
        role: 'customer',
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    }),
  ]);

  const totalRevenue = revenue._sum.totalAmount ?? 0;
  const totalOrders = orders._count ?? 0;
  const avgOrderValue = orders._avg.totalAmount ?? 0;

  return {
    period,
    dateRange: { start, end },
    totalOrders,
    totalRevenue,
    avgOrderValue: Math.round(avgOrderValue),
    newCustomers: customers._count ?? 0,
  };
}

/**
 * Get revenue trend (daily breakdown for the period).
 */
export async function getRevenueTrend(period: Period) {
  const { start, end } = getDateRange(period);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { not: 'cancelled' },
      paymentStatus: 'paid',
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const grouped: Record<string, { revenue: number; orders: number }> = {};

  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = { revenue: 0, orders: 0 };
    }
    grouped[dateKey].revenue += order.totalAmount;
    grouped[dateKey].orders += 1;
  }

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));
}

/**
 * Get popular menu items.
 */
export async function getPopularItems(limit: number = 10) {
  const items = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: {
      order: {
        status: { not: 'cancelled' },
      },
    },
    _sum: { quantity: true, price: true },
    _count: true,
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  // Fetch menu item details
  const itemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, name: true, price: true, image: true },
  });

  const menuItemMap = new Map(menuItems.map((m: { id: string }) => [m.id, m]));

  return items.map((item: { menuItemId: string; _sum: { quantity: number | null; price: number | null }; _count: number }) => ({
    menuItem: menuItemMap.get(item.menuItemId),
    totalQuantity: item._sum.quantity ?? 0,
    totalRevenue: item._sum.price ?? 0,
    orderCount: item._count,
  }));
}

/**
 * Get orders by status distribution.
 */
export async function getOrderStatusDistribution(period: Period) {
  const { start, end } = getDateRange(period);

  const distribution = await prisma.order.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: start, lte: end },
    },
    _count: true,
  });

  return distribution.map((d: { status: string; _count: number }) => ({
    status: d.status,
    count: d._count,
  }));
}

/**
 * Get payment method breakdown.
 */
export async function getPaymentMethodBreakdown(period: Period) {
  const { start, end } = getDateRange(period);

  const breakdown = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: {
      createdAt: { gte: start, lte: end },
      status: { not: 'cancelled' },
    },
    _count: true,
    _sum: { totalAmount: true },
  });

  return breakdown.map((b: { paymentMethod: string; _count: number; _sum: { totalAmount: number | null } }) => ({
    method: b.paymentMethod,
    count: b._count,
    total: b._sum.totalAmount ?? 0,
  }));
}

/**
 * Get peak hours analysis.
 */
export async function getPeakHours(period: Period) {
  const { start, end } = getDateRange(period);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { not: 'cancelled' },
    },
    select: { createdAt: true },
  });

  // Group by hour
  const hourly: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourly[h] = 0;

  for (const order of orders) {
    const hour = order.createdAt.getHours();
    hourly[hour] += 1;
  }

  return Object.entries(hourly).map(([hour, count]) => ({
    hour: Number(hour),
    orders: count,
  }));
}

/**
 * Get full report data.
 */
export async function getReport(period: Period) {
  const [overview, revenueTrend, popularItems, statusDistribution, paymentBreakdown, peakHours] =
    await Promise.all([
      getOverview(period),
      getRevenueTrend(period),
      getPopularItems(10),
      getOrderStatusDistribution(period),
      getPaymentMethodBreakdown(period),
      getPeakHours(period),
    ]);

  return {
    overview,
    revenueTrend,
    popularItems,
    statusDistribution,
    paymentBreakdown,
    peakHours,
  };
}
