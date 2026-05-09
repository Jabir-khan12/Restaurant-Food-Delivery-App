import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const riderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, enum: ['bike', 'car', 'bicycle'] },
    vehiclePlate: { type: String },
    cnicFront: { type: String },
    cnicBack: { type: String },
    licenseImage: { type: String },
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isAvailable: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    liveLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    completedDeliveries: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    lastHeartbeat: { type: Date },
  },
  { timestamps: true },
);

riderSchema.index({ liveLocation: '2dsphere' });
riderSchema.index({ isAvailable: 1, isOnline: 1, kycStatus: 1 });

export const Rider = mongoose.model('Rider', riderSchema);
