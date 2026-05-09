import { Job, Worker } from 'bullmq';

import { Resend } from 'resend';
import { logger } from '../infra/logger.js';
import { QUEUES } from '../queues.js';


export function createEmailWorker(connection) {
  const resend = new Resend(process.env.RESEND_API_KEY || 'test');

  const worker = new Worker(
    QUEUES.EMAIL,
    async (job) => {
      const { to, subject, html, from } = job.data;

      logger.info({ jobId: job.id, to, subject }, 'Processing email job');

      const result = await resend.emails.send({
        from: from || process.env.EMAIL_FROM || 'FlavourFleet <no-reply@flavourfleet.com>',
        to,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(`Email send failed: ${result.error.message}`);
      }

      logger.info({ jobId: job.id, emailId: result.data?.id }, 'Email sent');
      return { emailId: result.data?.id };
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Email job failed');
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Email job completed');
  });

  return worker;
}
