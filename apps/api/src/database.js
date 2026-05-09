import mongoose from 'mongoose';
import { logger } from './infra/logger.js';

export async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 50,
      retryWrites: true,
      retryReads: true,
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error({ error }, 'MongoDB connection failed');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
