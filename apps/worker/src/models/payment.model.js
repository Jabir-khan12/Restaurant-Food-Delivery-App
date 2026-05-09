import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
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
    refunds: [
      {
        amount: { type: Number, required: true },
        reason: { type: String },
        gatewayRefundId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const PaymentModel =
  mongoose.models.Payment || mongoose.model('Payment', schema);

export default PaymentModel;
