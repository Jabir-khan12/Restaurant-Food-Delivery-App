import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const reviewSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    images: [{ type: String }],
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

reviewSchema.index({ restaurantId: 1, moderationStatus: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
