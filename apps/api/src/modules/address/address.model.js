import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, trim: true },
    street: { type: String },
    area: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Pakistan' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ location: '2dsphere' });
addressSchema.index({ userId: 1, isDefault: 1 });

export const Address = mongoose.model('Address', addressSchema);
