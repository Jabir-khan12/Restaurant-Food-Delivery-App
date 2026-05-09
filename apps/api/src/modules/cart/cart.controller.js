
import * as cartService from './cart.service.js';
export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.userId);
    res.json({ success: true, data: { cart } });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req, res, next) {
  try {
    const cart = await cartService.addToCart(req.user.userId, req.body);
    res.json({ success: true, data: { cart } });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(
  req,
  res,
  next,
) {
  try {
    const cart = await cartService.updateCartItem(
      req.user.userId,
      req.params.itemId,
      req.body.quantity,
    );
    res.json({ success: true, data: { cart } });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.userId);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
}
