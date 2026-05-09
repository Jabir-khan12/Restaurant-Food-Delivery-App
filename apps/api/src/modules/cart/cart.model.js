import mongoose, { Schema } from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────

const cartItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedModifiers: [
      {
        groupId: { type: String },
        groupName: { type: String },
        modifiers: [
          {
            name: { type: String },
            price: { type: Number, default: 0 },
          },
        ],
      },
    ],
    itemTotal: { type: Number, required: true },
  },
  { _id: true },
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    couponCode: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

// TTL Index — auto-expire abandoned carts after 7 days
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ userId: 1 });

export const Cart = mongoose.model('Cart', cartSchema);
