
import { Restaurant } from './restaurant.model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../infra/logger.js';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createRestaurant(
  ownerId,
  input,
) {
  let slug = slugify(input.name);

  // Ensure unique slug
  const existing = await Restaurant.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const restaurant = await Restaurant.create({
    ownerId,
    name: input.name,
    slug,
    description: input.description,
    cuisine: input.cuisine,
    phone: input.phone,
    email: input.email,
    address: input.address,
    location: input.address.location,
    openingHours: input.openingHours,
    minOrderValue: input.minOrderValue,
    taxRate: input.taxRate,
    estimatedPrepTime: input.estimatedPrepTime,
    status: 'pending',
  });

  logger.info({ restaurantId: restaurant._id, ownerId }, 'Restaurant created');
  return restaurant;
}

export async function getRestaurantById(id) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw new NotFoundError('Restaurant not found');
  return restaurant;
}

export async function getRestaurantBySlug(slug) {
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) throw new NotFoundError('Restaurant not found');
  return restaurant;
}

export async function updateRestaurant(
  id,
  ownerId,
  input,
) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw new NotFoundError('Restaurant not found');
  if (restaurant.ownerId.toString() !== ownerId) {
    throw new ForbiddenError('Not authorized to update this restaurant');
  }

  Object.assign(restaurant, input);
  if (input.address?.location) {
    restaurant.location = input.address.location;
  }
  await restaurant.save();

  logger.info({ restaurantId: id }, 'Restaurant updated');
  return restaurant;
}

export async function toggleRestaurantOpen(
  id,
  ownerId,
) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw new NotFoundError('Restaurant not found');
  if (restaurant.ownerId.toString() !== ownerId) {
    throw new ForbiddenError('Not authorized');
  }
  if (restaurant.status !== 'active') {
    throw new BadRequestError('Restaurant must be active to toggle open/close');
  }

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();
  return restaurant;
}

export async function searchRestaurants(params) {
  const { lat, lng, q, cuisine, page, limit } = params;
  const filter = {
    status: 'active',
  };

  if (q) {
    filter.$text = { $search: q };
  }

  if (cuisine) {
    filter.cuisine = cuisine;
  }

  // Geo query: find restaurants within 10km
  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 10000, // 10km
      },
    };
  }

  const skip = (page - 1) * limit;
  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).skip(skip).limit(limit).lean(),
    Restaurant.countDocuments(filter),
  ]);

  return { restaurants, total };
}

export async function getOwnerRestaurants(ownerId) {
  return Restaurant.find({ ownerId }).sort({ createdAt: -1 }).lean();
}

// ─── Admin functions ──────────────────────────────────────────────────────────

export async function updateRestaurantStatus(
  id,
  status,
) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw new NotFoundError('Restaurant not found');
  restaurant.status = status;
  await restaurant.save();
  logger.info({ restaurantId: id, status }, 'Restaurant status updated by admin');
  return restaurant;
}
