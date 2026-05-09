import { Router } from 'express';
import * as orderController from './order.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createOrderSchema, updateOrderStatusSchema, cancelOrderSchema } from '@flavour-fleet/types';

const router = Router();

router.use(authenticate);

// Customer
router.post('/', requireRole('customer'), validate(createOrderSchema), controller.createOrder);
router.get('/my', requireRole('customer'), controller.getMyOrders);
router.post('/:id/cancel', requireRole('customer'), validate(cancelOrderSchema), controller.cancelOrder);

// Restaurant owner / kitchen
router.get(
  '/restaurant/:restaurantId',
  requireRole('owner', 'kitchen', 'admin'),
  controller.getRestaurantOrders,
);

// Status update (owner, kitchen, rider, admin)
router.patch(
  '/:id/status',
  requireRole('owner', 'kitchen', 'rider', 'admin'),
  validate(updateOrderStatusSchema),
  controller.updateStatus,
);

// Shared
router.get('/:id', controller.getOrderById);

// Admin analytics
router.get('/admin/stats', requireRole('admin'), controller.getStats);

export default router;
