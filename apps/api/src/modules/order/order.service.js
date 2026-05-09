
import { Order } from './order.model.js';
import { Cart } from '../cart/cart.model.js';
import { Address } from '../address/address.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';
import { DeliveryZone } from '../restaurant/deliveryZone.model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { generateOrderNumber } from '../../utils/helpers.js';
import { logger } from '../../infra/logger.js';

// ─── Valid State Transitions ──────────────────────────────────────────────────

const VALID_TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up'],
  picked_up: ['on_the_way'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createOrder(
  userId,
  userRole,
  input,
) {
  // 1. Get cart
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  if (cart.restaurantId.toString() !== input.restaurantId) {
    throw new BadRequestError('Cart restaurant does not match order restaurant');
  }

  // 2. Validate restaurant
  const restaurant = await Restaurant.findById(input.restaurantId);
  if (!restaurant || restaurant.status !== 'active' || !restaurant.isOpen) {
    throw new BadRequestError('Restaurant is not available');
  }

  // 3. Validate minimum order
  if (restaurant.minOrderValue > 0 && cart.subtotal < restaurant.minOrderValue) {
    throw new BadRequestError(
      `Minimum order value is ${restaurant.minOrderValue}. Your cart total is ${cart.subtotal}.`,
    );
  }

  // 4. Get delivery address
  const address = await Address.findOne({ _id: input.deliveryAddressId, userId });
  if (!address) {
    throw new NotFoundError('Delivery address not found');
  }

  // 5. Check delivery zone
  const zone = await DeliveryZone.findOne({
    restaurantId: input.restaurantId,
    isActive: true,
    polygon: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: address.location?.coordinates || [0, 0],
        },
      },
    },
  });

  const deliveryFee = zone
    ? cart.subtotal >= zone.freeDeliveryThreshold && zone.freeDeliveryThreshold > 0
      ? 0
      : zone.baseDeliveryFee
    : 0; // If no zone defined, no delivery fee (or throw error)

  // 6. Calculate final pricing
  const pricing = {
    subtotal: cart.subtotal,
    taxAmount: cart.taxAmount,
    deliveryFee,
    discount: cart.discount,
    tip: input.tip || 0,
    total: cart.subtotal + cart.taxAmount + deliveryFee - cart.discount + (input.tip || 0),
  };

  // 7. Generate order number
  const orderNo = generateOrderNumber();

  // 8. Create order
  const order = await Order.create({
    orderNo,
    userId,
    restaurantId: input.restaurantId,
    deliveryAddress: {
      area: address.area,
      city: address.city,
      location: address.location,
    },
    items: cart.items.map((item) => ({
      menuItemId: item.menuItemId.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers,
      itemTotal: item.itemTotal,
    })),
    pricing,
    status: 'placed',
    statusTimeline: [
      {
        status: 'placed',
        timestamp: new Date(),
        actor: userId,
        actorRole: userRole,
      },
    ],
    paymentStatus: input.paymentGateway === 'cod' ? 'pending' : 'pending',
    scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
    specialInstructions: input.specialInstructions,
    estimatedDeliveryAt: new Date(
      Date.now() + (restaurant.estimatedPrepTime + (zone?.estimatedDeliveryMins || 30)) * 60 * 1000,
    ),
  });

  // 9. Clear cart
  await Cart.deleteOne({ userId });

  logger.info({ orderId: order._id, orderNo, userId }, 'Order created');

  return order;
}

// ─── Update Order Status ──────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId,
  actorId,
  actorRole,
  newStatus,
  note,
) {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError('Order not found');

  // Validate transition
  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition from "${order.status}" to "${newStatus}"`,
    );
  }

  // Role-based transition rules
  validateActorForTransition(actorRole, newStatus, order);

  order.status = newStatus;
  order.statusTimeline.push({
    status: newStatus,
    timestamp: new Date(),
    actor: actorId,
    actorRole,
    note,
  });

  if (newStatus === 'cancelled') {
    order.cancellationReason = note;
    order.cancelledBy = actorId;
  }

  await order.save();

  logger.info({ orderId, status: newStatus, actor: actorId }, 'Order status updated');

  return order;
}

function validateActorForTransition(role, newStatus, order) {
  const rules = {
    confirmed: ['owner', 'kitchen', 'admin'],
    preparing: ['owner', 'kitchen', 'admin'],
    ready: ['owner', 'kitchen', 'admin'],
    picked_up: ['rider', 'admin'],
    on_the_way: ['rider', 'admin'],
    delivered: ['rider', 'admin'],
    cancelled: ['customer', 'owner', 'admin'], // customer can cancel before pickup
  };

  if (rules[newStatus] && !rules[newStatus].includes(role)) {
    throw new ForbiddenError(`Role "${role}" cannot transition order to "${newStatus}"`);
  }

  // Customer can only cancel before picked_up
  if (newStatus === 'cancelled' && role === 'customer') {
    const nonCancellable = ['picked_up', 'on_the_way', 'delivered'];
    if (nonCancellable.includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }
  }
}

// ─── Get Orders ───────────────────────────────────────────────────────────────

export async function getUserOrders(userId, page, limit) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ userId }),
  ]);
  return { orders, total };
}

export async function getRestaurantOrders(
  restaurantId,
  status,
  page = 1,
  limit = 20,
) {
  const filter = { restaurantId };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { orders, total };
}

export async function getRiderOrders(riderId, status) {
  const filter = { riderId };
  if (status) filter.status = status;
  return Order.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate('userId', 'name email phone')
    .populate('restaurantId', 'name phone address');
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

export async function assignRider(orderId, riderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError('Order not found');
  order.riderId = riderId;
  await order.save();
  logger.info({ orderId, riderId }, 'Rider assigned to order');
  return order;
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────

export async function getOrderStats(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        revenue: [
          { $match: { status: { $ne: 'cancelled' } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.total' },
              totalOrders: { $sum: 1 },
              avgOrderValue: { $avg: '$pricing.total' },
            },
          },
        ],
        dailyRevenue: [
          { $match: { status: { $ne: 'cancelled' } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$pricing.total' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        topItems: [
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.name',
              totalOrdered: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.itemTotal' },
            },
          },
          { $sort: { totalOrdered: -1 } },
          { $limit: 10 },
        ],
        cancellationRate: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              cancelled: {
                $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              total: 1,
              cancelled: 1,
              rate: {
                $cond: [
                  { $eq: ['$total', 0] },
                  0,
                  { $multiply: [{ $divide: ['$cancelled', '$total'] }, 100] },
                ],
              },
            },
          },
        ],
      },
    },
  ]);
}
