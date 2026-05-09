import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const openingHourSchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    open: { type: String },
    close: { type: String },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false },
);

const restaurantSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    cuisine: [{ type: String, trim: true }],
    logo: { type: String },
    coverImage: { type: String },
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: {
      area: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'Pakistan' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    openingHours: [openingHourSchema],
    isOpen: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'pending',
    },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    estimatedPrepTime: { type: Number, default: 30 },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ name: 'text', cuisine: 'text' });
restaurantSchema.index({ status: 1, isOpen: 1 });

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
