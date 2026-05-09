import { Job, Worker } from 'bullmq';

import mongoose from 'mongoose';
import { logger } from '../infra/logger.js';
import { QUEUES } from '../queues.js';
import NotificationModel from '../models/notification.model.js';


export function createNotificationWorker(connection) {
  const worker = new Worker(
    QUEUES.NOTIFICATION,
    async (job) => {
      const { userId, type, title, body, data, channel } = job.data;

      logger.info({ jobId: job.id, userId, type, channel }, 'Processing notification');

      const notification = await NotificationModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        title,
        body,
        data: data || {},
        channel,
        status: 'sent',
        sentAt: new Date(),
      });

      // If channel is push, dispatch to push service (future integration)
      if (channel === 'push') {
        logger.info({ notificationId: notification._id }, 'Push notification queued (stub)');
      }

      return { notificationId: notification._id };
    },
    {
      connection,
      concurrency: 10,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Notification job failed');
  });

  return worker;
}
