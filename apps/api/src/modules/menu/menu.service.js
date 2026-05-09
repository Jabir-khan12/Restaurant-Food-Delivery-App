
import { MenuCategory, MenuItem } from './menu.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(
  restaurantId,
  ownerId,
  input,
) {
  await verifyOwnership(restaurantId, ownerId);
  return MenuCategory.create({ restaurantId, ...input });
}

export async function getCategories(restaurantId) {
  return MenuCategory.find({ restaurantId, isActive: true }).sort({ sortOrder: 1 }).lean();
}

export async function updateCategory(
  categoryId,
  ownerId,
  input,
) {
  const cat = await MenuCategory.findById(categoryId).populate('restaurantId');
  if (!cat) throw new NotFoundError('Category not found');
  await verifyOwnership(cat.restaurantId.toString(), ownerId);
  Object.assign(cat, input);
  await cat.save();
  return cat;
}

export async function deleteCategory(categoryId, ownerId) {
  const cat = await MenuCategory.findById(categoryId);
  if (!cat) throw new NotFoundError('Category not found');
  await verifyOwnership(cat.restaurantId.toString(), ownerId);
  // Soft delete — set inactive
  cat.isActive = false;
  await cat.save();
  // Also deactivate items in this category
  await MenuItem.updateMany({ categoryId }, { isAvailable: false });
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function createItem(
  restaurantId,
  ownerId,
  input,
) {
  await verifyOwnership(restaurantId, ownerId);
  return MenuItem.create({ restaurantId, ...input });
}

export async function getItems(restaurantId, categoryId) {
  const filter = { restaurantId, isAvailable: true };
  if (categoryId) filter.categoryId = categoryId;
  return MenuItem.find(filter).sort({ name: 1 }).lean();
}

export async function getItemById(id) {
  const item = await MenuItem.findById(id);
  if (!item) throw new NotFoundError('Menu item not found');
  return item;
}

export async function updateItem(
  itemId,
  ownerId,
  input,
) {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new NotFoundError('Menu item not found');
  await verifyOwnership(item.restaurantId.toString(), ownerId);
  Object.assign(item, input);
  await item.save();
  return item;
}

export async function toggleItemAvailability(itemId, ownerId) {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new NotFoundError('Menu item not found');
  await verifyOwnership(item.restaurantId.toString(), ownerId);
  item.isAvailable = !item.isAvailable;
  await item.save();
  return item;
}

export async function searchItems(restaurantId, query) {
  return MenuItem.find({
    restaurantId,
    isAvailable: true,
    $text: { $search: query },
  })
    .sort({ score: { $meta: 'textScore' } })
    .lean();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyOwnership(restaurantId, ownerId) {
  const restaurant = await Restaurant.findById(restaurantId).select('ownerId').lean();
  if (!restaurant) throw new NotFoundError('Restaurant not found');
  if (restaurant.ownerId.toString() !== ownerId) {
    throw new ForbiddenError('Not authorized to manage this restaurant menu');
  }
}
