import { Job, Worker } from 'bullmq';

import { logger } from '../infra/logger.js';
import { QUEUES } from '../queues.js';
import OrderModel from '../models/order.model.js';


export function createOrderLifecycleWorker(connection) {
  const worker = new Worker(
    QUEUES.ORDER_LIFECYCLE,
    async (job) => {
      const { type, orderId } = job.data;

      logger.info({ jobId: job.id, type, orderId }, 'Processing order lifecycle job');

      switch (type) {
        case 'auto_cancel_unconfirmed': {
          // Cancel orders that haven't been confirmed within 10 minutes
          if (orderId) {
            const order = await OrderModel.findById(orderId);
            if (order && order.status === 'placed') {
              order.status = 'cancelled';
              order.statusTimeline.push({
                status: 'cancelled',
                timestamp: new Date(),
                note: 'Auto-cancelled: restaurant did not confirm in time',
              });
              order.cancellationReason = 'Restaurant did not respond';
              order.cancelledBy = 'system';
              await order.save();
              logger.info({ orderId }, 'Auto-cancelled unconfirmed order');
            }
          }
          break;
        }

        case 'stale_order_sweep': {
          // Find orders stuck in non-terminal states for too long
          const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours
          const staleOrders = await OrderModel.find({
            status: { $in: ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'] },
            createdAt: { $lt: cutoff },
          }).limit(50);

          for (const order of staleOrders) {
            logger.warn({ orderId: order._id, status: order.status }, 'Found stale order');
            // Notify admin about stale orders rather than auto-cancelling
          }

          logger.info({ count: staleOrders.length }, 'Stale order sweep complete');
          break;
        }

        case 'delivery_timeout': {
          if (orderId) {
            const order = await OrderModel.findById(orderId);
            if (order && order.status === 'on_the_way') {
              // Check if delivery has exceeded estimated time by 30 min
              const estimatedAt = order.estimatedDeliveryAt;
              if (estimatedAt && new Date() > new Date(estimatedAt.getTime() + 30 * 60 * 1000)) {
                logger.warn({ orderId }, 'Delivery significantly delayed');
                // Trigger notification to admin and customer
              }
            }
          }
          break;
        }
      }
    },
    {
      connection,
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Order lifecycle job failed');
  });

  return worker;
}
