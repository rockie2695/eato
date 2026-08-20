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
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current user's cart
 *     description: Retrieve the authenticated user's shopping cart with items.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
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
 * @swagger
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     description: Add a menu item to the cart. If item exists, increments quantity.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Menu item not found
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
 * @swagger
 * /cart/items/{id}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item
 *     description: Update quantity or special instructions for a cart item.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
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
 * @swagger
 * /cart/items/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     description: Remove a specific item from the cart.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
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
 * @swagger
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear cart
 *     description: Remove all items from the cart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared
 *       401:
 *         description: Authentication required
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
