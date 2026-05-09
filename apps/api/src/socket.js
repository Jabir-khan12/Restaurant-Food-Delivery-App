import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import { logger } from './infra/logger.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.WEB_URL || 'http://localhost:5173',
        process.env.ADMIN_URL || 'http://localhost:5174',
      ],
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // 1MB
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // ─── Authentication Middleware ──────────────────────────────────────────────

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection Handler ────────────────────────────────────────────────────

  io.on('connection', (socket) => {
    const { userId, role } = socket.data;
    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    // Auto-join user-specific and role-specific rooms
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);

    // ─── Order room management ────────────────────────────────────────────

    socket.on('order:join', (data) => {
      socket.join(`order:${data.orderId}`);
      logger.debug({ userId, orderId: data.orderId }, 'Joined order room');
    });

    socket.on('order:leave', (data) => {
      socket.leave(`order:${data.orderId}`);
    });

    // ─── Restaurant room (for owners/kitchen) ────────────────────────────

    socket.on('restaurant:join', (data) => {
      socket.join(`restaurant:${data.restaurantId}`);
    });

    // ─── Rider location updates ──────────────────────────────────────────

    socket.on('rider:update_location', (data) => {
      // Broadcast to assigned order room
      if (data.orderId) {
        io.to(`order:${data.orderId}`).emit('rider:location', {
          orderId: data.orderId,
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
          speed: data.speed,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // ─── Disconnect ──────────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      logger.debug({ userId, reason }, 'Socket disconnected');
    });
  });

  return io;
}
