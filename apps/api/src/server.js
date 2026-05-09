import 'dotenv/config';
import http from 'http';
import { validateEnv, serverEnvSchema } from '@flavour-fleet/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './database.js';
import { createRedisClient, disconnectRedis } from './infra/redis.js';
import { createSocketServer } from './socket.js';
import { logger } from './infra/logger.js';

async function bootstrap() {
  // ─── Validate Environment ───────────────────────────────────────────────────

  const env = validateEnv(serverEnvSchema);
  logger.info({ env: env.NODE_ENV }, 'Environment validated');

  // ─── Connect to Database ────────────────────────────────────────────────────

  await connectDatabase(env.MONGO_URI);

  // ─── Connect to Redis ──────────────────────────────────────────────────────

  const redis = createRedisClient(env.REDIS_URL);
  try {
    await redis.connect();
  } catch (redisErr) {
    logger.warn('⚠️  Redis connection failed. Continuing without Redis (development mode)');
  }

  // ─── Create Express App ─────────────────────────────────────────────────────

  const app = createApp();
  const httpServer = http.createServer(app);

  // ─── Create Socket.io Server ────────────────────────────────────────────────

  const io = createSocketServer(httpServer);

  // Make io accessible from request handlers
  app.set('io', io);

  // ─── Start Server ──────────────────────────────────────────────────────────

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT}`);
    logger.info(`📡 Socket.io server ready`);
    logger.info(`🏥 Health check: ${env.API_URL}/healthz`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    httpServer.close(() => {
      logger.info('HTTP server closed');
    });

    io.close();
    await disconnectRedis();
    await disconnectDatabase();

    logger.info('Graceful shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught Exception — shutting down');
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.fatal({ error }, 'Failed to start server');
  process.exit(1);
});
