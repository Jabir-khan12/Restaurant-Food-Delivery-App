import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { Rider } from './rider.model.js';
import { Order } from '../order/order.model.js';

import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../infra/logger.js';

const router = Router();
router.use(authenticate);

// ─── Rider profile setup ─────────────────────────────────────────────────────

router.post('/profile', requireRole('rider'), async (req, res, next) => {
  try {
    let rider = await Rider.findOne({ userId: req.user.userId });
    if (rider) {
      Object.assign(rider, req.body);
      rider.kycStatus = 'submitted';
    } else {
      rider = new Rider({ userId: req.user.userId, ...req.body, kycStatus: 'submitted' });
    }
    await rider.save();
    res.json({ success: true, data: { rider } });
  } catch (error) {
    next(error);
  }
});

// ─── Toggle online/available ──────────────────────────────────────────────────

router.patch('/toggle-online', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');
    if (rider.kycStatus !== 'verified') throw new BadRequestError('KYC not verified');

    rider.isOnline = !rider.isOnline;
    if (!rider.isOnline) rider.isAvailable = false;
    rider.lastHeartbeat = new Date();
    await rider.save();
    res.json({ success: true, data: { rider } });
  } catch (error) {
    next(error);
  }
});

router.patch('/toggle-available', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');
    if (!rider.isOnline) throw new BadRequestError('Must be online to toggle availability');

    rider.isAvailable = !rider.isAvailable;
    await rider.save();
    res.json({ success: true, data: { rider } });
  } catch (error) {
    next(error);
  }
});

// ─── Update location ─────────────────────────────────────────────────────────

router.patch('/location', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');

    rider.liveLocation = req.body.location;
    rider.lastHeartbeat = new Date();
    await rider.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ─── Accept / Reject order ───────────────────────────────────────────────────

router.post('/orders/:orderId/accept', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');
    if (rider.currentOrderId) throw new BadRequestError('Already on a delivery');

    const order = await Order.findById(req.params.orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.riderId) throw new BadRequestError('Order already assigned');

    order.riderId = rider._id;
    await order.save();

    rider.currentOrderId = order._id;
    rider.isAvailable = false;
    await rider.save();

    logger.info({ riderId: rider._id, orderId: order._id }, 'Rider accepted order');
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
});

router.post('/orders/:orderId/reject', requireRole('rider'), async (req, res, next) => {
  try {
    // Just log rejection; system will find next rider
    logger.info({ riderId: req.user.userId, orderId: req.params.orderId }, 'Rider rejected order');
    res.json({ success: true, message: 'Order rejected' });
  } catch (error) {
    next(error);
  }
});

// ─── Complete delivery ────────────────────────────────────────────────────────

router.post('/orders/:orderId/complete', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');

    const order = await Order.findById(req.params.orderId);
    if (!order || order.riderId?.toString() !== rider._id.toString()) {
      throw new BadRequestError('Order not assigned to you');
    }

    order.status = 'delivered';
    order.statusTimeline.push({
      status: 'delivered',
      timestamp: new Date(),
      actor: req.user.userId,
      actorRole: 'rider',
    });
    await order.save();

    rider.currentOrderId = undefined;
    rider.isAvailable = true;
    rider.completedDeliveries += 1;
    await rider.save();

    logger.info({ riderId: rider._id, orderId: order._id }, 'Delivery completed');
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
});

// ─── Get assigned orders ──────────────────────────────────────────────────────

router.get('/my-orders', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');
    const orders = await Order.find({ riderId: rider._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
});

// ─── Get rider profile ───────────────────────────────────────────────────────

router.get('/profile', requireRole('rider'), async (req, res, next) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.userId });
    if (!rider) throw new NotFoundError('Rider profile not found');
    res.json({ success: true, data: { rider } });
  } catch (error) {
    next(error);
  }
});

// ─── Admin: KYC management ───────────────────────────────────────────────────

router.get('/admin/all', requireRole('admin'), async (_req, res, next) => {
  try {
    const riders = await Rider.find().populate('userId', 'name email phone').lean();
    res.json({ success: true, data: { riders } });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/:riderId/kyc', requireRole('admin'), async (req, res, next) => {
  try {
    const rider = await Rider.findById(req.params.riderId);
    if (!rider) throw new NotFoundError('Rider not found');
    rider.kycStatus = req.body.status;
    await rider.save();
    res.json({ success: true, data: { rider } });
  } catch (error) {
    next(error);
  }
});

export default router;
