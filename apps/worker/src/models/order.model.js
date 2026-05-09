import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusTimeline: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    estimatedDeliveryAt: { type: Date },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
  },
  { timestamps: true, strict: false },
);

const OrderModel =
  mongoose.models.Order || mongoose.model('Order', schema);

export default OrderModel;
