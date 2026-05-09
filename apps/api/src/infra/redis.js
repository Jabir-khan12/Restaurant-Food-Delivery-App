import Redis from 'ioredis';
import { logger } from './logger.js';

let redis = null;

export function createRedisClient(url) {
  if (redis) return redis;

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redis;
}

export function getRedis() {
  if (!redis) {
    throw new Error('Redis client not initialized. Call createRedisClient first.');
  }
  return redis;
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis disconnected gracefully');
  }
}
