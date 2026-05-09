import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const refundSchema = new Schema(
  {
    amount: { type: Number, required: true },
    reason: { type: String },
    gatewayRef: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gateway: { type: String, enum: ['stripe', 'cod'], required: true },
    method: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    gatewayTransactionId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    idempotencyKey: { type: String, unique: true, sparse: true },
    refunds: [refundSchema],
  },
  { timestamps: true },
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ idempotencyKey: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
