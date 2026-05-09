
import * as menuService from './menu.service.js';
// Helper to extract typed route param
const p = (req, key) => req.params[key];

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(req, res, next) {
  try {
    const category = await menuService.createCategory(
      p(req, 'restaurantId'),
      req.user.userId,
      req.body,
    );
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await menuService.getCategories(p(req, 'restaurantId'));
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await menuService.updateCategory(
      p(req, 'categoryId'),
      req.user.userId,
      req.body,
    );
    res.json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await menuService.deleteCategory(p(req, 'categoryId'), req.user.userId);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function createItem(req, res, next) {
  try {
    const item = await menuService.createItem(
      p(req, 'restaurantId'),
      req.user.userId,
      req.body,
    );
    res.status(201).json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
}

export async function getItems(req, res, next) {
  try {
    const items = await menuService.getItems(
      p(req, 'restaurantId'),
      req.query.categoryId,
    );
    res.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
}

export async function getItemById(req, res, next) {
  try {
    const item = await menuService.getItemById(p(req, 'itemId'));
    res.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const item = await menuService.updateItem(p(req, 'itemId'), req.user.userId, req.body);
    res.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
}

export async function toggleAvailability(
  req,
  res,
  next,
) {
  try {
    const item = await menuService.toggleItemAvailability(p(req, 'itemId'), req.user.userId);
    res.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
}

export async function searchItems(req, res, next) {
  try {
    const items = await menuService.searchItems(
      p(req, 'restaurantId'),
      req.query.q,
    );
    res.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
}
