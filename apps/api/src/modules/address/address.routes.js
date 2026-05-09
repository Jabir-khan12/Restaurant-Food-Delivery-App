import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { addressSchema } from '@flavour-fleet/types';
import { Address } from './address.model.js';

import { NotFoundError } from '../../utils/errors.js';

const router = Router();
router.use(authenticate);

// Get all addresses
router.get('/', async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user.userId }).sort({ isDefault: -1 });
    res.json({ success: true, data: { addresses } });
  } catch (error) {
    next(error);
  }
});

// Create address
router.post('/', validate(addressSchema), async (req, res, next) => {
  try {
    // If setting, unset other defaults
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user.userId }, { isDefault: false });
    }
    const address = await Address.create({ userId: req.user.userId, ...req.body });
    res.status(201).json({ success: true, data: { address } });
  } catch (error) {
    next(error);
  }
});

// Update address
router.patch('/:id', async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!address) throw new NotFoundError('Address not found');
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user.userId }, { isDefault: false });
    }
    Object.assign(address, req.body);
    await address.save();
    res.json({ success: true, data: { address } });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Address.deleteOne({ _id: req.params.id, userId: req.user.userId });
    if (result.deletedCount === 0) throw new NotFoundError('Address not found');
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
