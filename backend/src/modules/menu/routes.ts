/**
 * Menu Routes.
 *
 * GET  /api/v1/menu/categories      - Get all categories
 * GET  /api/v1/menu/items           - Get menu items (paginated)
 * GET  /api/v1/menu/items/:id       - Get single item
 * GET  /api/v1/menu/featured        - Get featured items
 * POST /api/v1/menu/categories      - Create category (admin)
 * POST /api/v1/menu/items           - Create item (admin)
 * PUT  /api/v1/menu/items/:id       - Update item (admin)
 * DELETE /api/v1/menu/items/:id     - Delete item (admin)
 */

import { Router, type Router as RouterType } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { createCategorySchema, createMenuItemSchema, updateMenuItemSchema } from './validation.js';
import * as menuService from './service.js';

const router: RouterType = Router();

// ?€?€ Public Routes ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€

/**
 * @swagger
 * /menu/categories:
 *   get:
 *     tags: [Menu]
 *     summary: Get all menu categories
 *     description: Retrieve all active menu categories sorted by order.
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuCategory'
 */
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await menuService.getCategories();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /menu/items:
 *   get:
 *     tags: [Menu]
 *     summary: Get menu items
 *     description: Retrieve menu items with pagination and optional filters.
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of menu items
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
 *                         $ref: '#/components/schemas/MenuItem'
 */
router.get('/items', async (req, res, next) => {
  try {
    const { categoryId, search, page, limit } = req.query;
    const result = await menuService.getItems({
      categoryId: categoryId as string,
      search: search as string,
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
 * /menu/items/{id}:
 *   get:
 *     tags: [Menu]
 *     summary: Get menu item by ID
 *     description: Retrieve a single menu item with its category.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items/:id', async (req, res, next) => {
  try {
    const item = await menuService.getItemById(req.params.id as string);
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /menu/featured:
 *   get:
 *     tags: [Menu]
 *     summary: Get featured menu items
 *     description: Retrieve featured menu items for homepage display.
 *     responses:
 *       200:
 *         description: List of featured items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 */
router.get('/featured', async (_req, res, next) => {
  try {
    const items = await menuService.getFeatured();
    res.json({ data: items });
  } catch (error) {
    next(error);
  }
});

// ?€?€ Admin Routes ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€

/**
 * @swagger
 * /menu/categories:
 *   post:
 *     tags: [Menu - Admin]
 *     summary: Create a menu category
 *     description: Create a new menu category. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MenuCategory'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.post(
  '/categories',
  requireAuth,
  requireRole('admin'),
  validate(createCategorySchema),
  async (req, res, next) => {
    try {
      const category = await menuService.createCategory(req.body);
      res.status(201).json({ data: category });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /menu/items:
 *   post:
 *     tags: [Menu - Admin]
 *     summary: Create a menu item
 *     description: Create a new menu item. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMenuItemRequest'
 *     responses:
 *       201:
 *         description: Item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.post(
  '/items',
  requireAuth,
  requireRole('admin'),
  validate(createMenuItemSchema),
  async (req, res, next) => {
    try {
      const item = await menuService.createItem(req.body);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /menu/items/{id}:
 *   put:
 *     tags: [Menu - Admin]
 *     summary: Update a menu item
 *     description: Update an existing menu item. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMenuItemRequest'
 *     responses:
 *       200:
 *         description: Item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Item not found
 */
router.put(
  '/items/:id',
  requireAuth,
  requireRole('admin'),
  validate(updateMenuItemSchema),
  async (req, res, next) => {
    try {
      const item = await menuService.updateItem(req.params.id as string, req.body);
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /menu/items/{id}:
 *   delete:
 *     tags: [Menu - Admin]
 *     summary: Delete a menu item
 *     description: Delete a menu item. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Menu item ID
 *     responses:
 *       204:
 *         description: Item deleted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Item not found
 */
router.delete(
  '/items/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      await menuService.deleteItem(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
