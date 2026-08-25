/**
 * Express Application Setup.
 *
 * Configures middleware, routes, and error handling.
 * This module creates the Express app without starting the server.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import { setupExpressErrorHandler } from './config/sentry.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/routes.js';
import menuRoutes from './modules/menu/routes.js';
import cartRoutes from './modules/cart/routes.js';
import orderRoutes from './modules/order/routes.js';
import paymentRoutes from './modules/payment/routes.js';
import staffRoutes from './modules/staff/routes.js';
import notificationRoutes from './modules/notification/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';

const app = express();

// ── Security Middleware ────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [config.WEB_URL, config.APP_URL],
    credentials: true,
  })
);

// ── Body Parsing ───────────────────────────────────────────────
// Note: /payments/webhook needs raw body, handled separately
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ───────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Swagger Documentation ───────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Eato API Documentation',
}));

// JSON spec for download
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// ── API Routes ─────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/menu', menuRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/analytics', analyticsRoutes);

app.use('/api/v1', apiRouter);

// ── 404 Handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
    code: 'NOT_FOUND',
    statusCode: 404,
  });
});

// ── Sentry Error Handler ──────────────────────────────────────
setupExpressErrorHandler(app);

// ── Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
