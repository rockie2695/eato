/**
 * Socket.io Configuration and Event Handlers.
 *
 * Sets up real-time communication for order updates.
 * Supports both Web and Mobile clients.
 */

import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

interface SocketUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Initialize Socket.io server.
 * @param httpServer - HTTP server instance
 * @returns Socket.io server instance
 */
export function initSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.WEB_URL, config.APP_URL],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ── Authentication Middleware ─────────────────────────────
  // Verify JWT token on connection
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const payload = jwt.verify(token as string, config.JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      (socket as unknown as { user: SocketUser }).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection Handler ────────────────────────────────────
  io.on('connection', (socket) => {
    const user = (socket as unknown as { user: SocketUser }).user;
    console.log(`🔌 User connected: ${user.email} (${socket.id})`);

    // Join user-specific room for targeted messages
    socket.join(`user:${user.id}`);

    // Staff/admin join their respective rooms
    if (['staff', 'kitchen', 'admin'].includes(user.role)) {
      socket.join('staff');
    }

    if (['kitchen', 'admin'].includes(user.role)) {
      socket.join('kitchen');
    }

    if (user.role === 'admin') {
      socket.join('admin');
    }

    // ── Event: Subscribe to order updates ─────────────────
    socket.on('order:subscribe', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`📡 ${user.email} subscribed to order ${orderId}`);
    });

    // ── Event: Unsubscribe from order updates ─────────────
    socket.on('order:unsubscribe', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    // ── Event: Join table room (for table-specific updates)
    socket.on('table:join', (tableNumber: number) => {
      socket.join(`table:${tableNumber}`);
    });

    // ── Disconnect ─────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${user.email}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
}

/**
 * Emit event to all connected staff.
 */
export function emitToStaff(io: Server, event: string, data: unknown) {
  io.to('staff').emit(event, data);
}

/**
 * Emit event to kitchen.
 */
export function emitToKitchen(io: Server, event: string, data: unknown) {
  io.to('kitchen').emit(event, data);
}

/**
 * Emit event to a specific user.
 */
export function emitToUser(
  io: Server,
  userId: string,
  event: string,
  data: unknown
) {
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to a specific order's subscribers.
 */
export function emitToOrder(
  io: Server,
  orderId: string,
  event: string,
  data: unknown
) {
  io.to(`order:${orderId}`).emit(event, data);
}
