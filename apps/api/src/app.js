import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { correlationId } from './middlewares/correlationId.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import restaurantRoutes from './modules/restaurant/restaurant.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import addressRoutes from './modules/address/address.routes.js';
import riderRoutes from './modules/rider/rider.routes.js';
import reviewRoutes from './modules/review/review.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';

export function createApp() {
  const app = express();

  // ─── Security Middleware ──────────────────────────────────────────────────────

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: [
        process.env.WEB_URL || 'http://localhost:5173',
        process.env.ADMIN_URL || 'http://localhost:5174',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-idempotency-key'],
    }),
  );

  app.use(hpp());
  app.use(mongoSanitize());
  app.use(cookieParser());

  // ─── Rate Limiting ────────────────────────────────────────────────────────────

  const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' } },
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts' } },
  });

  app.use(globalLimiter);

  // ─── Body Parsing ─────────────────────────────────────────────────────────────

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Correlation ID & Logging ─────────────────────────────────────────────────

  app.use(correlationId);

  // ─── Health Check ─────────────────────────────────────────────────────────────

  app.get('/healthz', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────────

  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/restaurants', restaurantRoutes);
  app.use('/api/v1/menu', menuRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/addresses', addressRoutes);
  app.use('/api/v1/riders', riderRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // ─── Error Handling ───────────────────────────────────────────────────────────

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
