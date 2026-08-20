/**
 * Notification Routes.
 *
 * GET    /api/v1/notifications/active   - Get active notifications (public)
 * GET    /api/v1/notifications          - Get all notifications (admin)
 * POST   /api/v1/notifications          - Create notification (admin)
 * GET    /api/v1/notifications/:id      - Get notification by ID (admin)
 * PUT    /api/v1/notifications/:id      - Update notification (admin)
 * DELETE /api/v1/notifications/:id      - Delete notification (admin)
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createNotificationSchema,
  updateNotificationSchema,
} from './validation.js';
import * as notificationService from './service.js';

const router = Router();

// ── Public Routes ──────────────────────────────────────────────

/**
 * @swagger
 * /notifications/active:
 *   get:
 *     tags: [Notifications]
 *     summary: Get active notifications
 *     description: |
 *       Retrieve all active, non-expired notifications.
 *       Optional filter by type (ticker or popup).
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ticker, popup]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: List of active notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 */
router.get('/active', async (req, res, next) => {
  try {
    const { type } = req.query;
    const notifications = await notificationService.getActive(
      type as 'ticker' | 'popup' | undefined
    );
    res.json({ data: notifications });
  } catch (error) {
    next(error);
  }
});

// ── Admin Routes ───────────────────────────────────────────────

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications - Admin]
 *     summary: Get all notifications
 *     description: Retrieve all notifications (including inactive). Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ticker, popup]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { type, page, limit } = req.query;
      const result = await notificationService.getAll({
        type: type as 'ticker' | 'popup' | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /notifications:
 *   post:
 *     tags: [Notifications - Admin]
 *     summary: Create a notification
 *     description: Create a new ticker or popup notification. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Notification created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validate(createNotificationSchema),
  async (req, res, next) => {
    try {
      const notification = await notificationService.create(req.body);
      res.status(201).json({ data: notification });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     tags: [Notifications - Admin]
 *     summary: Get notification by ID
 *     description: Retrieve a single notification. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification details
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Notification not found
 */
router.get(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const notification = await notificationService.getById(req.params.id);
      res.json({ data: notification });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     tags: [Notifications - Admin]
 *     summary: Update a notification
 *     description: Update an existing notification. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification updated
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Notification not found
 */
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate(updateNotificationSchema),
  async (req, res, next) => {
    try {
      const notification = await notificationService.update(
        req.params.id,
        req.body
      );
      res.json({ data: notification });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications - Admin]
 *     summary: Delete a notification
 *     description: Delete a notification. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Notification deleted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Notification not found
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      await notificationService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
