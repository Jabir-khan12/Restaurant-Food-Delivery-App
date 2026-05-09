
import * as orderService from './order.service.js';
import { buildPaginationMeta } from '../../utils/pagination.js';

const p = (req, key) => req.params[key];

export async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.userId, req.user.role, req.body);
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { orders, total } = await orderService.getUserOrders(req.user.userId, page, limit);
    res.json({
      success: true,
      data: { orders },
      meta: buildPaginationMeta({ page, limit, total }),
    });
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantOrders(
  req,
  res,
  next,
) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const { orders, total } = await orderService.getRestaurantOrders(
      p(req, 'restaurantId'),
      status,
      page,
      limit,
    );
    res.json({
      success: true,
      data: { orders },
      meta: buildPaginationMeta({ page, limit, total }),
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(p(req, 'id'));
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(
      p(req, 'id'),
      req.user.userId,
      req.user.role,
      req.body.status,
      req.body.note,
    );
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(
      p(req, 'id'),
      req.user.userId,
      req.user.role,
      'cancelled',
      req.body.reason,
    );
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const startDate = new Date(req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const endDate = new Date(req.query.endDate || new Date());
    const stats = await orderService.getOrderStats(startDate, endDate);
    res.json({ success: true, data: { stats: stats[0] } });
  } catch (error) {
    next(error);
  }
}
