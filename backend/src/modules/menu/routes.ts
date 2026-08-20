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

import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { createCategorySchema, createMenuItemSchema, updateMenuItemSchema } from './validation.js';
import * as menuService from './service.js';

const router = Router();

// ── Public Routes ──────────────────────────────────────────────

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await menuService.getCategories();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

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

router.get('/items/:id', async (req, res, next) => {
  try {
    const item = await menuService.getItemById(req.params.id);
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
});

router.get('/featured', async (_req, res, next) => {
  try {
    const items = await menuService.getFeatured();
    res.json({ data: items });
  } catch (error) {
    next(error);
  }
});

// ── Admin Routes ───────────────────────────────────────────────

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

router.put(
  '/items/:id',
  requireAuth,
  requireRole('admin'),
  validate(updateMenuItemSchema),
  async (req, res, next) => {
    try {
      const item = await menuService.updateItem(req.params.id, req.body);
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/items/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      await menuService.deleteItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
