/**
 * Server Entry Point.
 *
 * Starts the HTTP server, database connection, Redis, and Socket.io.
 */

import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { redis } from './config/redis.js';
import { initSocketIO } from './socket/index.js';
import { setSocketIO } from './modules/order/routes.js';
import { initSentry } from './config/sentry.js';

async function main() {
  // ── Initialize Sentry ────────────────────────────────────
  initSentry();

  // ── Connect to Database ───────────────────────────────────
  await connectDatabase();

  // ── Test Redis Connection ──────────────────────────────────
  try {
    await redis.ping();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('⚠️  Redis connection failed:', error);
    // Continue without Redis - caching will be skipped
  }

  // ── Create HTTP Server ────────────────────────────────────
  const httpServer = http.createServer(app);

  // ── Initialize Socket.io ──────────────────────────────────
  const io = initSocketIO(httpServer);
  setSocketIO(io);

  // ── Start Server ──────────────────────────────────────────
  httpServer.listen(config.PORT, () => {
    console.log(`
  🍽️  Eato Backend Server
  ───────────────────────
  🌐 Environment: ${config.NODE_ENV}
  🚀 Port:        ${config.PORT}
  📡 API:         http://localhost:${config.PORT}/api/v1
  ❤️  Health:      http://localhost:${config.PORT}/health
  🔌 Socket.io:   Ready
  ───────────────────────
    `);
  });

  // ── Graceful Shutdown ─────────────────────────────────────
  const shutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');

    httpServer.close(async () => {
      await disconnectDatabase();
      redis.disconnect();
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('⏰ Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
