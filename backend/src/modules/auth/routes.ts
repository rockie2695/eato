/**
 * Auth Routes.
 *
 * POST /api/v1/auth/register - Register new customer
 * POST /api/v1/auth/login    - Login with credentials
 * POST /api/v1/auth/refresh  - Refresh access token
 * POST /api/v1/auth/logout   - Logout (blacklist token)
 * GET  /api/v1/auth/me       - Get current user profile
 */

import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { loginSchema, registerSchema, refreshSchema } from './validation.js';
import * as authService from './service.js';

const router = Router();

/**
 * POST /register
 * Create a new customer account.
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
 * POST /login
 * Authenticate with email and password.
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
 * POST /refresh
 * Get new access token using refresh token.
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
 * POST /logout
 * Blacklist the refresh token.
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
 * GET /me
 * Get current authenticated user profile.
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
