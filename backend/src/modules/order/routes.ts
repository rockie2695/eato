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
 * POST /
 * Create a new order.
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
 * GET /my
 * Get current user's orders.
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
 * GET /
 * Get all orders (staff/admin only).
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
 * GET /:id
 * Get order by ID.
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
 * PATCH /:id/status
 * Update order status (staff/admin only).
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
 * POST /:id/cancel
 * Cancel an order (customer only).
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
