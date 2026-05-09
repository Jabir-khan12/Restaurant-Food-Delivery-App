import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const deliveryZoneSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    polygon: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]], required: true },
    },
    isActive: { type: Boolean, default: true },
    baseDeliveryFee: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    estimatedDeliveryMins: { type: Number, default: 30 },
  },
  { timestamps: true },
);

deliveryZoneSchema.index({ polygon: '2dsphere' });

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
