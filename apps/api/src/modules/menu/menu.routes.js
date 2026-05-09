import { Router } from 'express';
import * as menuController from './menu.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { menuCategorySchema, menuItemSchema, updateMenuItemSchema } from '@flavour-fleet/types';

const router = Router();

// Public
router.get('/:restaurantId/categories', menuController.getCategories);
router.get('/:restaurantId/items', menuController.getItems);
router.get('/:restaurantId/items/search', menuController.searchItems);
router.get('/items/:itemId', menuController.getItemById);

// Owner router.use(authenticate);
router.post(
  '/:restaurantId/categories',
  requireRole('owner'),
  validate(menuCategorySchema),
  menuController.createCategory,
);
router.patch(
  '/categories/:categoryId',
  requireRole('owner'),
  validate(menuCategorySchema),
  menuController.updateCategory,
);
router.delete('/categories/:categoryId', requireRole('owner'), menuController.deleteCategory);

router.post(
  '/:restaurantId/items',
  requireRole('owner'),
  validate(menuItemSchema),
  menuController.createItem,
);
router.patch(
  '/items/:itemId',
  requireRole('owner'),
  validate(updateMenuItemSchema),
  menuController.updateItem,
);
router.patch(
  '/items/:itemId/toggle-availability',
  requireRole('owner'),
  menuController.toggleAvailability,
);

export default router;
