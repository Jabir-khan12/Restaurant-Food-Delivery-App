import { nanoid } from 'nanoid';

/**
 * Generates a unique order number: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const id = nanoid(5).toUpperCase();
  return `ORD-${date}-${id}`;
}

/**
 * Generates a correlation ID for request tracing
 */
export function generateCorrelationId() {
  return nanoid(16);
}
