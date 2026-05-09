import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createReviewSchema } from '@flavour-fleet/types';
import { Review } from './review.model.js';
import { Order } from '../order/order.model.js';
import { Restaurant } from '../restaurant/restaurant.model.js';

import { BadRequestError, NotFoundError } from '../../utils/errors.js';

const router = Router();

// ─── Public: Get restaurant reviews ───────────────────────────────────────────

router.get('/restaurant/:restaurantId', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({
        restaurantId: req.params.restaurantId,
        moderationStatus: 'approved',
      })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({
        restaurantId: req.params.restaurantId,
        moderationStatus: 'approved',
      }),
    ]);

    res.json({ success: true, data: { reviews, total } });
  } catch (error) {
    next(error);
  }
});

// ─── Protected routes ─────────────────────────────────────────────────────────

router.use(authenticate);

// Create review (post-delivery only)
router.post(
  '/',
  requireRole('customer'),
  validate(createReviewSchema),
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.body.orderId);
      if (!order) throw new NotFoundError('Order not found');
      if (order.userId.toString() !== req.user.userId) {
        throw new BadRequestError('Can only review your own orders');
      }
      if (order.status !== 'delivered') {
        throw new BadRequestError('Can only review delivered orders');
      }

      // Check if already reviewed
      const existing = await Review.findOne({ orderId: req.body.orderId });
      if (existing) throw new BadRequestError('Order already reviewed');

      const review = await Review.create({
        orderId: req.body.orderId,
        userId: req.user.userId,
        restaurantId: order.restaurantId,
        riderId: order.riderId,
        foodRating: req.body.foodRating,
        deliveryRating: req.body.deliveryRating,
        comment: req.body.comment,
        images: req.body.images,
      });

      // Update restaurant average rating
      const stats = await Review.aggregate([
        { $match: { restaurantId: order.restaurantId, moderationStatus: { $ne: 'rejected' } } },
        {
          $group,
        },
      ]);

      if (stats.length > 0) {
        await Restaurant.updateOne(
          { _id: order.restaurantId },
          {
            avgRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].count,
          },
        );
      }

      res.status(201).json({ success: true, data: { review } });
    } catch (error) {
      next(error);
    }
  },
);

// Admin: moderate reviews
router.patch(
  '/:id/moderate',
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) throw new NotFoundError('Review not found');
      review.moderationStatus = req.body.status;
      await review.save();
      res.json({ success: true, data: { review } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
