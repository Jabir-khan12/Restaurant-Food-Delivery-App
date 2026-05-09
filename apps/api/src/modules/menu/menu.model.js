import mongoose, { Schema } from 'mongoose';

// ─── Menu Category ────────────────────────────────────────────────────────────

const menuCategorySchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

menuCategorySchema.index({ restaurantId: 1, isActive: 1, sortOrder: 1 });

export const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);

// ─── Modifier Group ───────────────────────────────────────────────────────────

const modifierSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const modifierGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    minSelect: { type: Number, default: 0 },
    maxSelect: { type: Number, default: 1 },
    modifiers: [modifierSchema],
  },
  { _id: true },
);

// ─── Menu Item ────────────────────────────────────────────────────────────────

const menuItemSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    prepTimeMins: { type: Number },
    tags: [{ type: String, trim: true }],
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    modifierGroups: [modifierGroupSchema],
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', tags: 'text' });
menuItemSchema.index({ categoryId: 1, sortOrder: 1 });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
