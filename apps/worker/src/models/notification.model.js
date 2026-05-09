import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['order_update', 'promo', 'system', 'rider_update'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    channel: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      default: 'in_app',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending',
    },
    retryCount: { type: Number, default: 0 },
    sentAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true },
);

const NotificationModel =
  mongoose.models.Notification || mongoose.model('Notification', schema);

export default NotificationModel;
