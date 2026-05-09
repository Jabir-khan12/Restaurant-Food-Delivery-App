import { Router } from 'express';
import * as menuController from './menu.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { menuCategorySchema, menuItemSchema, updateMenuItemSchema } from '@flavour-fleet/types';

const router = Router();

// Public
router.get('/:restaurantId/categories', controller.getCategories);
router.get('/:restaurantId/items', controller.getItems);
router.get('/:restaurantId/items/search', controller.searchItems);
router.get('/items/:itemId', controller.getItemById);

// Owner router.use(authenticate);
router.post(
  '/:restaurantId/categories',
  requireRole('owner'),
  validate(menuCategorySchema),
  controller.createCategory,
);
router.patch(
  '/categories/:categoryId',
  requireRole('owner'),
  validate(menuCategorySchema),
  controller.updateCategory,
);
router.delete('/categories/:categoryId', requireRole('owner'), controller.deleteCategory);

router.post(
  '/:restaurantId/items',
  requireRole('owner'),
  validate(menuItemSchema),
  controller.createItem,
);
router.patch(
  '/items/:itemId',
  requireRole('owner'),
  validate(updateMenuItemSchema),
  controller.updateItem,
);
router.patch(
  '/items/:itemId/toggle-availability',
  requireRole('owner'),
  controller.toggleAvailability,
);

export default router;
