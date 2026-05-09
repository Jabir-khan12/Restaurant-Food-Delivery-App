import { Router } from 'express';
import * as cartController from './cart.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { addToCartSchema, updateCartItemSchema } from '@flavour-fleet/types';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addToCart);
router.patch('/items/:itemId', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/', cartController.clearCart);

export default router;
