import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  phone: z.string().min(10).max(20).optional(),
  role: z.enum(['customer', 'owner', 'rider']).default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  avatar: z.string().url().optional(),
});

// ─── Address Schema ───────────────────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(200),
  area: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(5).default('PK'),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  }),
  isDefault: z.boolean().default(false),
});

// ─── Restaurant Schemas ───────────────────────────────────────────────────────

const openingHourSchema = z.object({
  day: z.number().int().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean().default(false),
});

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  cuisine: z.array(z.string().min(1)).min(1, 'At least one cuisine is required'),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional(),
  address: z.object({
    street: z.string().min(1).max(200),
    area: z.string().max(100).optional(),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(5).default('PK'),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }),
  }),
  openingHours: z.array(openingHourSchema).min(1),
  minOrderValue: z.number().int().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  estimatedPrepTime: z.number().int().min(1).max(120).default(30),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

// ─── Menu Schemas ─────────────────────────────────────────────────────────────

export const menuCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const modifierSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
});

const modifierGroupSchema = z.object({
  name: z.string().min(1).max(100),
  required: z.boolean().default(false),
  minSelect: z.number().int().min(0).default(0),
  maxSelect: z.number().int().min(1).default(1),
  modifiers: z.array(modifierSchema).min(1),
});

export const menuItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  price: z.number().int().min(1, 'Price must be greater than 0'),
  images: z.array(z.string().url()).max(5).default([]),
  isAvailable: z.boolean().default(true),
  prepTimeMins: z.number().int().min(1).max(120).default(20),
  tags: z.array(z.string().min(1)).max(10).default([]),
  discountPercent: z.number().min(0).max(100).default(0),
  modifierGroups: z.array(modifierGroupSchema).default([]),
});

export const updateMenuItemSchema = menuItemSchema.partial();

// ─── Cart Schemas ─────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  selectedModifiers: z
    .array(
      z.object({
        groupId: z.string().min(1),
        modifiers: z.array(
          z.object({
            name: z.string().min(1),
            price: z.number().int().min(0),
          }),
        ),
      }),
    )
    .default([]),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

// ─── Order Schemas ────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  deliveryAddressId: z.string().min(1),
  paymentGateway: z.enum(['stripe', 'easypaisa', 'jazzcash', 'cod']),
  tip: z.number().int().min(0).default(0),
  specialInstructions: z.string().max(500).optional(),
  scheduledFor: z.string().datetime().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'placed',
    'confirmed',
    'preparing',
    'ready',
    'picked_up',
    'on_the_way',
    'delivered',
    'cancelled',
  ]),
  note: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500),
});

// ─── Review Schemas ───────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  orderId: z.string().min(1),
  foodRating: z.number().int().min(1).max(5),
  deliveryRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(3).default([]),
});

// ─── Rider Schemas ────────────────────────────────────────────────────────────

export const riderProfileSchema = z.object({
  vehicleType: z.enum(['bike', 'car', 'bicycle']),
  vehiclePlate: z.string().min(1).max(20),
  cnicFront: z.string().url(),
  cnicBack: z.string().url(),
  licenseImage: z.string().url().optional(),
});

export const riderLocationSchema = z.object({
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  }),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
});

// ─── Delivery Zone Schemas ────────────────────────────────────────────────────

export const deliveryZoneSchema = z.object({
  name: z.string().min(1).max(100),
  polygon: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  isActive: z.boolean().default(true),
  baseDeliveryFee: z.number().int().min(0),
  freeDeliveryThreshold: z.number().int().min(0).default(0),
  estimatedDeliveryMins: z.number().int().min(1).default(45),
});

// ─── Promo Code Schema ────────────────────────────────────────────────────────

export const promoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['percentage', 'flat']),
  value: z.number().min(1),
  minOrderValue: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().min(0).optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  usageLimit: z.number().int().min(1).default(100),
  perUserLimit: z.number().int().min(1).default(1),
  applicableRestaurants: z.array(z.string()).default([]),
});

// ─── Pagination & Query Schemas ───────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = paginationSchema.extend({
  q: z.string().max(200).optional(),
});
