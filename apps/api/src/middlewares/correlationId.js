
import { generateCorrelationId } from '../utils/helpers.js';
import { logger } from '../infra/logger.js';

/**
 * Adds a correlation ID to every request for distributed tracing.
 * Also logs request start and finish.
 */
export function correlationId(req, res, next) {
  const id = (req.headers['x-request-id']) || generateCorrelationId();
  req.headers['x-request-id'] = id;
  res.setHeader('x-request-id', id);

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId: id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId,
    });
  });

  next();
}
