import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const statusTimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String },
    actorRole: { type: String },
    note: { type: String },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedModifiers: [
      {
        groupId: { type: String },
        groupName: { type: String },
        modifiers: [{ name: { type: String }, price: { type: Number } }],
      },
    ],
    itemTotal: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
    deliveryAddress: {
      area: { type: String },
      city: { type: String },
      location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tip: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusTimeline: [statusTimelineSchema],
    paymentRef: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    scheduledFor: { type: Date },
    estimatedDeliveryAt: { type: Date },
    specialInstructions: { type: String },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'processing', 'completed', 'failed'],
      default: 'none',
    },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ riderId: 1, status: 1 });
orderSchema.index({ orderNo: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
