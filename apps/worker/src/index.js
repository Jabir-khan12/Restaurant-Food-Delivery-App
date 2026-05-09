import 'dotenv/config';
import mongoose from 'mongoose';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';

import { logger } from './infra/logger.js';
import { QUEUES } from './queues.js';
import { createEmailWorker } from './workers/email.worker.js';
import { createNotificationWorker } from './workers/notification.worker.js';
import { createOrderLifecycleWorker } from './workers/orderLifecycle.worker.js';
import { createPaymentWorker } from './workers/payment.worker.js';

async function bootstrap() {
  // ─── MongoDB ──────────────────────────────────────────────────────────────
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/flavour-fleet';
  await mongoose.connect(mongoUri);
  logger.info('Worker connected to MongoDB');

  // ─── Redis connection for BullMQ ──────────────────────────────────────────
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisInstance = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  // Cast to avoid ioredis version mismatch between direct dep and BullMQ's dep
  const connection = redisInstance;

  redisInstance.on('connect', () => logger.info('Worker connected to Redis'));
  redisInstance.on('error', (err) => logger.error({ err }, 'Worker Redis error'));

  // ─── Start workers ────────────────────────────────────────────────────────
  const emailWorker = createEmailWorker(connection);
  const notificationWorker = createNotificationWorker(connection);
  const orderLifecycleWorker = createOrderLifecycleWorker(connection);
  const paymentWorker = createPaymentWorker(connection);

  logger.info('All workers started');

  // ─── Scheduled jobs (repeatable) ──────────────────────────────────────────
  const orderQueue = new Queue(QUEUES.ORDER_LIFECYCLE, { connection });

  // Sweep stale orders every 30 minutes
  await orderQueue.add(
    'stale-order-sweep',
    { type: 'stale_order_sweep' },
    {
      repeat: { every: 30 * 60 * 1000 }, // Every 30 min
      removeOnComplete: true,
      removeOnFail: 100,
    },
  );

  logger.info('Scheduled jobs registered');

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info({ signal }, 'Worker shutting down...');

    await emailWorker.close();
    await notificationWorker.close();
    await orderLifecycleWorker.close();
    await paymentWorker.close();
    await orderQueue.close();
    await redisInstance.quit();
    await mongoose.disconnect();

    logger.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Worker bootstrap failed');
  process.exit(1);
});
