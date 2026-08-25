/**
 * Analytics Routes.
 *
 * GET /analytics/report          - Full report for a period
 * GET /analytics/overview        - Overview stats
 * GET /analytics/revenue-trend   - Revenue over time
 * GET /analytics/popular-items   - Top selling items
 * GET /analytics/status-dist     - Orders by status
 * GET /analytics/payment-dist    - Payment method breakdown
 * GET /analytics/peak-hours      - Orders by hour of day
 */

import { Router, type Router as RouterType } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as analyticsService from './service.js';
import { reportQuerySchema, popularItemsQuerySchema } from './validation.js';

const router: RouterType = Router();

/**
 * @swagger
 * /analytics/report:
 *   get:
 *     summary: Get full report
 *     description: Get complete analytics report for a given period (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Full report data
 */
router.get(
  '/report',
  requireAuth,
  requireRole('admin'),
  validate(reportQuerySchema),
  async (req, res) => {
    const { period } = req.query as { period: analyticsService.Period };
    const report = await analyticsService.getReport(period);
    res.json({ data: report });
  }
);

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get overview stats
 *     description: Get summary statistics for a period (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Overview stats
 */
router.get(
  '/overview',
  requireAuth,
  requireRole('admin'),
  validate(reportQuerySchema),
  async (req, res) => {
    const { period } = req.query as { period: analyticsService.Period };
    const overview = await analyticsService.getOverview(period);
    res.json({ data: overview });
  }
);

/**
 * @swagger
 * /analytics/revenue-trend:
 *   get:
 *     summary: Get revenue trend
 *     description: Get revenue over time for a period (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Revenue trend data
 */
router.get(
  '/revenue-trend',
  requireAuth,
  requireRole('admin'),
  validate(reportQuerySchema),
  async (req, res) => {
    const { period } = req.query as { period: analyticsService.Period };
    const trend = await analyticsService.getRevenueTrend(period);
    res.json({ data: trend });
  }
);

/**
 * @swagger
 * /analytics/popular-items:
 *   get:
 *     summary: Get popular items
 *     description: Get top selling menu items (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Popular items list
 */
router.get(
  '/popular-items',
  requireAuth,
  requireRole('admin'),
  validate(popularItemsQuerySchema),
  async (req, res) => {
    const { limit } = req.query as { limit?: number };
    const items = await analyticsService.getPopularItems(limit ?? 10);
    res.json({ data: items });
  }
);

/**
 * @swagger
 * /analytics/status-dist:
 *   get:
 *     summary: Get order status distribution
 *     description: Get order count by status for a period (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Status distribution
 */
router.get(
  '/status-dist',
  requireAuth,
  requireRole('admin'),
  validate(reportQuerySchema),
  async (req, res) => {
    const { period } = req.query as { period: analyticsService.Period };
    const dist = await analyticsService.getOrderStatusDistribution(period);
    res.json({ data: dist });
  }
);

/**
 * @swagger
 * /analytics/payment-dist:
 *   get:
 *     summary: Get payment method breakdown
 *     description: Get order and revenue by payment method (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Payment breakdown
 */
router.get(
  '/payment-dist',
  requireAuth,
  requireRole('admin'),
  validate(reportQuerySchema),
  async (req, res) => {
    const { period } = req.query as { period: analyticsService.Period };
    const dist = await analyticsService.getPaymentMethodBreakdown(period);
    res.json({ data: dist });
  }
);

/**
 * @swagger
 * /analytics/peak-hours:
 *   get:
 *     summary: Get peak hours
 *     description: Get order count by hour of day (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Peak hours data
 */
router.get(
  '/peak-hours',
  requireAuth,
  requireRole('admin'),
  validate(reportQuerySchema),
  async (req, res) => {
    const { period } = req.query as { period: analyticsService.Period };
    const hours = await analyticsService.getPeakHours(period);
    res.json({ data: hours });
  }
);

export default router;
