
import { Cart } from './cart.model.js';
import { MenuItem } from '../menu/menu.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

const CART_EXPIRE_DAYS = 7;

export async function getCart(userId) {
  return Cart.findOne({ userId }).lean();
}

export async function addToCart(userId, input) {
  const menuItem = await MenuItem.findById(input.menuItemId);
  if (!menuItem) throw new NotFoundError('Menu item not found');
  if (!menuItem.isAvailable) throw new BadRequestError('Menu item is not available');

  const restaurant = await Restaurant.findById(menuItem.restaurantId);
  if (!restaurant || !restaurant.isOpen) {
    throw new BadRequestError('Restaurant is not available');
  }

  let cart = await Cart.findOne({ userId });

  // If cart exists for a different restaurant, clear it
  if (cart && cart.restaurantId.toString() !== menuItem.restaurantId.toString()) {
    await Cart.deleteOne({ userId });
    cart = null;
  }

  // Calculate item total (base price + modifiers) * quantity
  const modifierTotal = input.selectedModifiers.reduce(
    (sum, group) =>
      sum + group.modifiers.reduce((s, m) => s + m.price, 0),
    0,
  );
  const itemTotal = (menuItem.price + modifierTotal) * input.quantity;

  // Apply discount if any
  const discountedTotal = menuItem.discountPercent
    ? Math.round(itemTotal * (1 - menuItem.discountPercent / 100))
    : itemTotal;

  if (!cart) {
    cart = new Cart({
      userId,
      restaurantId: menuItem.restaurantId,
      items: [],
      expiresAt: new Date(Date.now() + CART_EXPIRE_DAYS * 24 * 60 * 60 * 1000),
    });
  }

  // Check if item already exists (same item + same modifiers)
  const existingIdx = cart.items.findIndex(
    (item) =>
      item.menuItemId.toString() === input.menuItemId &&
      JSON.stringify(item.selectedModifiers) === JSON.stringify(input.selectedModifiers),
  );

  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += input.quantity;
    cart.items[existingIdx].itemTotal += discountedTotal;
  } else {
    cart.items.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: input.quantity,
      selectedModifiers: input.selectedModifiers.map((sg) => ({
        groupId: sg.groupId,
        groupName: sg.groupId, // will be enriched
        modifiers: sg.modifiers,
      })),
      itemTotal: discountedTotal,
    });
  }

  recalculateTotals(cart, restaurant.taxRate);
  await cart.save();
  return cart;
}

export async function updateCartItem(
  userId,
  itemId,
  quantity,
) {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new NotFoundError('Cart not found');

  if (quantity === 0) {
    // Remove item
    cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return cart;
    }
  } else {
    const item = cart.items.find((i) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundError('Cart item not found');

    const unitPrice =
      item.price +
      item.selectedModifiers.reduce(
        (sum, sg) => sum + sg.modifiers.reduce((s, m) => s + m.price, 0),
        0,
      );
    item.quantity = quantity;
    item.itemTotal = unitPrice * quantity;
  }

  const restaurant = await Restaurant.findById(cart.restaurantId).select('taxRate').lean();
  recalculateTotals(cart, restaurant?.taxRate || 0);
  await cart.save();
  return cart;
}

export async function clearCart(userId) {
  await Cart.deleteOne({ userId });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recalculateTotals(cart, taxRate) {
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  cart.taxAmount = Math.round(cart.subtotal * (taxRate / 100));
  // Delivery fee will be calculated at checkout based on delivery zone
  cart.total = cart.subtotal + cart.taxAmount + cart.deliveryFee - cart.discount;
}
