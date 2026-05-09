import { Router } from 'express';
import * as cartController from './cart.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { addToCartSchema, updateCartItemSchema } from '@flavour-fleet/types';

const router = Router();

router.use(authenticate);

router.get('/', controller.getCart);
router.post('/items', validate(addToCartSchema), controller.addToCart);
router.patch('/items/:itemId', validate(updateCartItemSchema), controller.updateCartItem);
router.delete('/', controller.clearCart);

export default router;
