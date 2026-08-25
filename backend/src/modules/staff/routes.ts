/**
 * Staff Routes.
 *
 * GET    /api/v1/staff      - Get all staff (admin)
 * POST   /api/v1/staff      - Create staff account (admin)
 * PUT    /api/v1/staff/:id  - Update staff member (admin)
 * DELETE /api/v1/staff/:id  - Delete staff member (admin)
 */

import { Router, type Router as RouterType } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema } from '../auth/validation.js';
import * as staffService from './service.js';

const router: RouterType = Router();

// All staff routes require admin role
router.use(requireAuth, requireRole('admin'));

/**
 * @swagger
 * /staff:
 *   get:
 *     tags: [Staff - Admin]
 *     summary: Get all staff members
 *     description: Retrieve all staff users. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
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
 * @swagger
 * /staff:
 *   post:
 *     tags: [Staff - Admin]
 *     summary: Create a staff account
 *     description: Create a new staff member account. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/RegisterRequest'
 *               - type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     enum: [staff, kitchen, admin]
 *                     default: staff
 *     responses:
 *       201:
 *         description: Staff account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       409:
 *         description: Email already registered
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
 * @swagger
 * /staff/{id}:
 *   put:
 *     tags: [Staff - Admin]
 *     summary: Update a staff member
 *     description: Update a staff member's profile. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Staff member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [staff, kitchen, admin]
 *     responses:
 *       200:
 *         description: Staff member updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Staff member not found
 */
router.put('/:id', async (req, res, next) => {
  try {
    const staff = await staffService.updateStaff(req.params.id as string, req.body);
    res.json({ data: staff });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     tags: [Staff - Admin]
 *     summary: Delete a staff member
 *     description: Delete a staff member's account. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Staff member ID
 *     responses:
 *       204:
 *         description: Staff member deleted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Staff member not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
