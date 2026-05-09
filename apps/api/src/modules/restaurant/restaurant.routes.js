import { Router } from 'express';
import * as restaurantController from './restaurant.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createRestaurantSchema, updateRestaurantSchema } from '@flavour-fleet/types';

const router = Router();

// Public
router.get('/search', restaurantController.search);
router.get('/slug/:slug', restaurantController.getBySlug);
router.get('/:id', restaurantController.getById);

// Owner routes
router.use(authenticate);
router.post('/', requireRole('owner'), validate(createRestaurantSchema), restaurantController.create);
router.get('/owner/my', requireRole('owner'), restaurantController.getOwnerRestaurants);
router.patch('/:id', requireRole('owner'), validate(updateRestaurantSchema), restaurantController.update);
router.patch('/:id/toggle-open', requireRole('owner'), restaurantController.toggleOpen);

// Admin routes
router.patch('/:id/status', requireRole('admin'), restaurantController.updateStatus);

export default router;
