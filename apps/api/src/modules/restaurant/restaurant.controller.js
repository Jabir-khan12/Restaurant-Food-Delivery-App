
import * as restaurantService from './restaurant.service.js';
const p = (req, key) => req.params[key];

export async function create(req, res, next) {
  try {
    const restaurant = await restaurantService.createRestaurant(req.user.userId, req.body);
    res.status(201).json({ success: true, data: { restaurant } });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const restaurant = await restaurantService.getRestaurantById(p(req, 'id'));
    res.json({ success: true, data: { restaurant } });
  } catch (error) {
    next(error);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const restaurant = await restaurantService.getRestaurantBySlug(p(req, 'slug'));
    res.json({ success: true, data: { restaurant } });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const restaurant = await restaurantService.updateRestaurant(
      p(req, 'id'),
      req.user.userId,
      req.body,
    );
    res.json({ success: true, data: { restaurant } });
  } catch (error) {
    next(error);
  }
}

export async function toggleOpen(req, res, next) {
  try {
    const restaurant = await restaurantService.toggleRestaurantOpen(
      p(req, 'id'),
      req.user.userId,
    );
    res.json({ success: true, data: { restaurant } });
  } catch (error) {
    next(error);
  }
}

export async function search(req, res, next) {
  try {
    const { lat, lng, q, cuisine, page = '1', limit = '20' } = req.query;
    const result = await restaurantService.searchRestaurants({
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      q,
      cuisine,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    res.json({
      success: true,
      data: { restaurants: result.restaurants },
      meta: { total: result.total, page: parseInt(page, 10), limit: parseInt(limit, 10) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOwnerRestaurants(
  req,
  res,
  next,
) {
  try {
    const restaurants = await restaurantService.getOwnerRestaurants(req.user.userId);
    res.json({ success: true, data: { restaurants } });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const restaurant = await restaurantService.updateRestaurantStatus(
      p(req, 'id'),
      req.body.status,
    );
    res.json({ success: true, data: { restaurant } });
  } catch (error) {
    next(error);
  }
}
