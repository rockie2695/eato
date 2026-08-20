/**
 * Cart Routes.
 *
 * GET    /api/v1/cart          - Get current cart
 * POST   /api/v1/cart/items    - Add item to cart
 * PUT    /api/v1/cart/items/:id - Update cart item
 * DELETE /api/v1/cart/items/:id - Remove cart item
 * DELETE /api/v1/cart          - Clear cart
 */

import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';
import * as cartService from './service.js';

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

/**
 * GET /
 * Get current user's cart.
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const cart = await cartService.getCart(req.user!.id);
    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /items
 * Add an item to the cart.
 */
router.post('/items', async (req: AuthRequest, res, next) => {
  try {
    const { menuItemId, quantity = 1, specialInstructions } = req.body;
    const cart = await cartService.addItem(
      req.user!.id,
      menuItemId,
      quantity,
      specialInstructions
    );
    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /items/:id
 * Update a cart item's quantity or instructions.
 */
router.put('/items/:id', async (req: AuthRequest, res, next) => {
  try {
    const { quantity, specialInstructions } = req.body;
    const cart = await cartService.updateItem(
      req.user!.id,
      req.params.id,
      quantity,
      specialInstructions
    );
    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /items/:id
 * Remove an item from the cart.
 */
router.delete('/items/:id', async (req: AuthRequest, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user!.id, req.params.id);
    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /
 * Clear all items from the cart.
 */
router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    await cartService.clearCart(req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
