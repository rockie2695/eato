/**
 * Staff Routes.
 *
 * GET    /api/v1/staff      - Get all staff (admin)
 * POST   /api/v1/staff      - Create staff account (admin)
 * PUT    /api/v1/staff/:id  - Update staff member (admin)
 * DELETE /api/v1/staff/:id  - Delete staff member (admin)
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema } from '../auth/validation.js';
import * as staffService from './service.js';

const router = Router();

// All staff routes require admin role
router.use(requireAuth, requireRole('admin'));

/**
 * GET /
 * Get all staff users.
 */
router.get('/', async (_req, res, next) => {
  try {
    const staff = await staffService.getAllStaff();
    res.json({ data: staff });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /
 * Create a new staff account.
 */
router.post('/', validate(registerSchema), async (req, res, next) => {
  try {
    const { role = 'staff' } = req.body;
    const staff = await staffService.createStaff({
      ...req.body,
      role,
    });
    res.status(201).json({ data: staff });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /:id
 * Update a staff member.
 */
router.put('/:id', async (req, res, next) => {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    res.json({ data: staff });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:id
 * Delete a staff member.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
