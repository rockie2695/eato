/**
 * Auth Routes.
 *
 * POST /api/v1/auth/register - Register new customer
 * POST /api/v1/auth/login    - Login with credentials
 * POST /api/v1/auth/refresh  - Refresh access token
 * POST /api/v1/auth/logout   - Logout (blacklist token)
 * GET  /api/v1/auth/me       - Get current user profile
 */

import { Router, type Router as RouterType } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { loginSchema, registerSchema, refreshSchema } from './validation.js';
import * as authService from './service.js';

const router: RouterType = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer account
 *     description: Create a new customer account with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password, name, phone } = req.body;
      const result = await authService.register(email, password, name, phone);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with credentials
 *     description: Authenticate with email and password to receive tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Get a new access token using a refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh',
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Blacklist the refresh token to prevent reuse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     description: Get the authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
