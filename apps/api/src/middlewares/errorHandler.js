

import { AppError } from '../utils/errors.js';
import { logger } from '../infra/logger.js';

/**
 * Global error handler – catches all errors and returns a consistent API response.
 */
export function errorHandler(
  err,
  req,
  res,
  _next,
) {
  const requestId = req.headers['x-request-id'];

  if (err instanceof AppError) {
    // Operational errors — expected, safe to return details
    logger.warn({
      requestId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Unexpected / programming errors — log full stack, return generic message
  logger.error({
    requestId,
    err,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'An unexpected error occurred',
    },
  });
}

/**
 * 404 handler — catches unmatched routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}
