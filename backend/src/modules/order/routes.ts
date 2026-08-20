/**
 * Order Routes.
 *
 * POST   /api/v1/orders              - Create new order
 * GET    /api/v1/orders/my           - Get current user's orders
 * GET    /api/v1/orders/:id          - Get order by ID
 * GET    /api/v1/orders              - Get all orders (staff/admin)
 * PATCH  /api/v1/orders/:id/status   - Update order status (staff/admin)
 * POST   /api/v1/orders/:id/cancel   - Cancel order (customer)
 */

import { Router } from 'express';
import { requireAuth, requireRole, type AuthRequest } from '../../middleware/auth.js';
import { orderLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from './validation.js';
import * as orderService from './service.js';
import type { Server } from 'socket.io';

const router = Router();

// Inject Socket.io instance into request
let io: Server | null = null;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

// All order routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     description: |
 *       Create a new order with items. Clears the cart on success.
 *       For online payments, returns a Stripe session ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid items or unavailable items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  orderLimiter,
  validate(createOrderSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const order = await orderService.createOrder(
        {
          userId: req.user!.id,
          ...req.body,
        },
        io || undefined
      );
      res.status(201).json({ data: order });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user's orders
 *     description: Retrieve the authenticated user's order history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, served, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of orders
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 */
router.get('/my', async (req: AuthRequest, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await orderService.getMyOrders(req.user!.id, {
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders - Staff]
 *     summary: Get all orders
 *     description: Retrieve all orders. Requires staff, kitchen, or admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, served, completed, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of all orders
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff role required
 */
router.get(
  '/',
  requireRole('staff', 'kitchen', 'admin'),
  async (req, res, next) => {
    try {
      const { status, page, limit } = req.query;
      const result = await orderService.getAllOrders({
        status: status as string,
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
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     description: Retrieve a specific order with its items.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id);
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders - Staff]
 *     summary: Update order status
 *     description: |
 *       Update the status of an order. Requires staff, kitchen, or admin role.
 *
 *       Valid status transitions:
 *       - pending → confirmed, cancelled
 *       - confirmed → preparing, cancelled
 *       - preparing → ready
 *       - ready → served
 *       - served → completed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Staff role required
 *       404:
 *         description: Order not found
 */
router.patch(
  '/:id/status',
  requireRole('staff', 'kitchen', 'admin'),
  validate(updateOrderStatusSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body.status,
        io || undefined
      );
      res.json({ data: order });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel an order
 *     description: |
 *       Cancel an order. Only allowed for the order owner before the order is confirmed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Order cannot be cancelled at this stage
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not the order owner
 *       404:
 *         description: Order not found
 */
router.post('/:id/cancel', async (req: AuthRequest, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user!.id);
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

export default router;
