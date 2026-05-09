import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { Notification } from './notification.model.js';

import { NotFoundError } from '../../utils/errors.js';

const router = Router();
router.use(authenticate);

// Get user notifications
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: req.user.userId }),
      Notification.countDocuments({ userId: req.user.userId, status: { $in: ['pending', 'sent'] } }),
    ]);

    res.json({
      success: true,
      data: { notifications, unreadCount },
      meta: { total, page, limit },
    });
  } catch (error) {
    next(error);
  }
});

// Mark
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status: 'read', readAt: new Date() },
      { new: true },
    );
    if (!notification) throw new NotFoundError('Notification not found');
    res.json({ success: true, data: { notification } });
  } catch (error) {
    next(error);
  }
});

// Mark all
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, status: { $in: ['pending', 'sent'] } },
      { status: 'read', readAt: new Date() },
    );
    res.json({ success: true, message: 'All notifications marked' });
  } catch (error) {
    next(error);
  }
});

export default router;
