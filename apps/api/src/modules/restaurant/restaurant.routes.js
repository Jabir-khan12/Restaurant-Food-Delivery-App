import { Router } from 'express';
import * as restaurantController from './restaurant.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createRestaurantSchema, updateRestaurantSchema } from '@flavour-fleet/types';

const router = Router();

// Public
router.get('/search', controller.search);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', controller.getById);

// Owner routes
router.use(authenticate);
router.post('/', requireRole('owner'), validate(createRestaurantSchema), controller.create);
router.get('/owner/my', requireRole('owner'), controller.getOwnerRestaurants);
router.patch('/:id', requireRole('owner'), validate(updateRestaurantSchema), controller.update);
router.patch('/:id/toggle-open', requireRole('owner'), controller.toggleOpen);

// Admin routes
router.patch('/:id/status', requireRole('admin'), controller.updateStatus);

export default router;
