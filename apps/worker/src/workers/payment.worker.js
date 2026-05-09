import { Job, Worker } from 'bullmq';

import Stripe from 'stripe';
import { logger } from '../infra/logger.js';
import { QUEUES } from '../queues.js';
import PaymentModel from '../models/payment.model.js';


export function createPaymentWorker(connection) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  const worker = new Worker(
    QUEUES.PAYMENT,
    async (job) => {
      const { type, orderId, amount, reason } = job.data;

      logger.info({ jobId: job.id, type, orderId }, 'Processing payment job');

      switch (type) {
        case 'process_refund': {
          const payment = await PaymentModel.findOne({ orderId });
          if (!payment || !payment.gatewayTransactionId) {
            throw new Error(`Payment not found for order ${orderId}`);
          }

          const refund = await stripe.refunds.create({
            payment_intent: payment.gatewayTransactionId,
            amount: amount || payment.amount,
            reason: 'requested_by_customer',
          });

          payment.refunds.push({
            amount: refund.amount ?? (amount || payment.amount),
            reason: reason || 'Customer requested refund',
            gatewayRefundId: refund.id,
            createdAt: new Date(),
          });
          payment.status = 'refunded';
          await payment.save();

          logger.info({ orderId, refundId: refund.id }, 'Refund processed');
          break;
        }

        case 'verify_payment': {
          const payment = await PaymentModel.findOne({ orderId });
          if (!payment || !payment.gatewayTransactionId) {
            throw new Error(`Payment not found for order ${orderId}`);
          }

          const intent = await stripe.paymentIntents.retrieve(payment.gatewayTransactionId);

          if (intent.status === 'succeeded' && payment.status !== 'captured') {
            payment.status = 'captured';
            await payment.save();
            logger.info({ orderId }, 'Payment verified and captured');
          }
          break;
        }

        case 'payout_restaurant': {
          // Placeholder for restaurant payout logic
          logger.info({ orderId }, 'Restaurant payout job (stub)');
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
    logger.error({ jobId: job?.id, err: err.message }, 'Payment job failed');
  });

  return worker;
}
