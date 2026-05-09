import 'dotenv/config';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { User } from '../modules/auth/user.model.js';
import { Restaurant } from '../modules/restaurant/restaurant.model.js';
import { MenuCategory, MenuItem } from '../modules/menu/menu.model.js';
import { DeliveryZone } from '../modules/restaurant/deliveryZone.model.js';
import { logger } from '../infra/logger.js';

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/flavour-fleet';
  await mongoose.connect(uri);
  logger.info('Connected to MongoDB for seeding');

  // ─── Admin User ─────────────────────────────────────────────────────────────

  const adminExists = await User.findOne({ email: 'admin@flavourfleet.com' });
  if (!adminExists) {
    await User.create({
      name: 'System Admin',
      email: 'admin@flavourfleet.com',
      passwordHash: await argon2.hash('Admin@123456'),
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });
    logger.info('✅ Admin user created: admin@flavourfleet.com / Admin@123456');
  }

  // ─── Sample Owner ──────────────────────────────────────────────────────────

  let owner = await User.findOne({ email: 'owner@demo.com' });
  if (!owner) {
    owner = await User.create({
      name: 'John Restaurant Owner',
      email: 'owner@demo.com',
      phone: '+923001234567',
      passwordHash: await argon2.hash('Owner@123456'),
      role: 'owner',
      status: 'active',
      emailVerified: true,
    });
    logger.info('✅ Owner user created: owner@demo.com / Owner@123456');
  }

  // ─── Sample Restaurant ─────────────────────────────────────────────────────

  let restaurant = await Restaurant.findOne({ slug: 'karachi-biryani-house' });
  if (!restaurant) {
    restaurant = await Restaurant.create({
      ownerId: owner._id,
      name: 'Karachi Biryani House',
      slug: 'karachi-biryani-house',
      description: 'Authentic Karachi-style biryani and BBQ',
      cuisine: ['Pakistani', 'BBQ', 'Biryani'],
      phone: '+923001234567',
      email: 'info@karachibiryani.com',
      address: {
        area: 'Saddar',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '74400',
        country: 'Pakistan',
      },
      location: {
        type: 'Point',
        coordinates: [67.0011, 24.8607],
      },
      openingHours: [
        { day: 0, open: '11:00', close: '23:00', isClosed: false },
        { day: 1, open: '11:00', close: '23:00', isClosed: false },
        { day: 2, open: '11:00', close: '23:00', isClosed: false },
        { day: 3, open: '11:00', close: '23:00', isClosed: false },
        { day: 4, open: '11:00', close: '23:00', isClosed: false },
        { day: 5, open: '12:00', close: '00:00', isClosed: false },
        { day: 6, open: '12:00', close: '00:00', isClosed: false },
      ],
      isOpen: true,
      status: 'active',
      minOrderValue: 50000, // 500 PKR
      taxRate: 16,
      estimatedPrepTime: 30,
    });
    logger.info('✅ Restaurant created: Karachi Biryani House');
  }

  // ─── Delivery Zone ─────────────────────────────────────────────────────────

  const zoneExists = await DeliveryZone.findOne({ restaurantId: restaurant._id });
  if (!zoneExists) {
    await DeliveryZone.create({
      restaurantId: restaurant._id,
      name: 'Karachi Central',
      polygon: {
        type: 'Polygon',
        coordinates: [[
          [66.95, 24.82],
          [67.05, 24.82],
          [67.05, 24.90],
          [66.95, 24.90],
          [66.95, 24.82],
        ]],
      },
      isActive: true,
      baseDeliveryFee: 15000, // 150 PKR
      freeDeliveryThreshold: 200000, // Free above 2000 PKR
      estimatedDeliveryMins: 35,
    });
    logger.info('✅ Delivery zone created');
  }

  // ─── Menu Categories ───────────────────────────────────────────────────────

  const catExists = await MenuCategory.findOne({ restaurantId: restaurant._id });
  if (!catExists) {
    const biryaniCat = await MenuCategory.create({
      restaurantId: restaurant._id,
      name: 'Biryani',
      description: 'Traditional rice dishes',
      sortOrder: 0,
    });

    const bbqCat = await MenuCategory.create({
      restaurantId: restaurant._id,
      name: 'BBQ',
      description: 'Grilled meats and kebabs',
      sortOrder: 1,
    });

    const drinksCat = await MenuCategory.create({
      restaurantId: restaurant._id,
      name: 'Drinks',
      description: 'Cold and hot beverages',
      sortOrder: 2,
    });

    // ─── Menu Items ──────────────────────────────────────────────────────────

    await MenuItem.create([
      {
        restaurantId: restaurant._id,
        categoryId: biryaniCat._id,
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender spiced chicken',
        price: 35000, // 350 PKR
        isAvailable: true,
        prepTimeMins: 25,
        tags: ['biryani', 'chicken', 'rice', 'spicy'],
        modifierGroups: [
          {
            name: 'Size',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { name: 'Regular', price: 0, isAvailable: true },
              { name: 'Large', price: 15000, isAvailable: true },
              { name: 'Family Pack', price: 50000, isAvailable: true },
            ],
          },
          {
            name: 'Extras',
            required: false,
            minSelect: 0,
            maxSelect: 3,
            modifiers: [
              { name: 'Extra Raita', price: 5000, isAvailable: true },
              { name: 'Extra Salad', price: 3000, isAvailable: true },
              { name: 'Extra Gravy', price: 8000, isAvailable: true },
            ],
          },
        ],
      },
      {
        restaurantId: restaurant._id,
        categoryId: biryaniCat._id,
        name: 'Mutton Biryani',
        description: 'Slow-cooked mutton in fragrant biryani rice',
        price: 55000, // 550 PKR
        isAvailable: true,
        prepTimeMins: 35,
        tags: ['biryani', 'mutton', 'rice', 'premium'],
        modifierGroups: [
          {
            name: 'Size',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { name: 'Regular', price: 0, isAvailable: true },
              { name: 'Large', price: 20000, isAvailable: true },
            ],
          },
        ],
      },
      {
        restaurantId: restaurant._id,
        categoryId: bbqCat._id,
        name: 'Seekh Kebab',
        description: 'Juicy minced meat kebabs grilled on skewers',
        price: 25000,
        isAvailable: true,
        prepTimeMins: 20,
        tags: ['bbq', 'kebab', 'grilled'],
        modifierGroups: [
          {
            name: 'Quantity',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { name: '4 Pieces', price: 0, isAvailable: true },
              { name: '8 Pieces', price: 25000, isAvailable: true },
            ],
          },
        ],
      },
      {
        restaurantId: restaurant._id,
        categoryId: bbqCat._id,
        name: 'Chicken Tikka',
        description: 'Marinated boneless chicken grilled to perfection',
        price: 30000,
        isAvailable: true,
        prepTimeMins: 20,
        tags: ['bbq', 'chicken', 'tikka'],
      },
      {
        restaurantId: restaurant._id,
        categoryId: drinksCat._id,
        name: 'Lassi',
        description: 'Traditional yogurt drink',
        price: 12000,
        isAvailable: true,
        prepTimeMins: 5,
        tags: ['drink', 'cold', 'traditional'],
        modifierGroups: [
          {
            name: 'Type',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { name: 'Sweet', price: 0, isAvailable: true },
              { name: 'Salty', price: 0, isAvailable: true },
              { name: 'Mango', price: 5000, isAvailable: true },
            ],
          },
        ],
      },
    ]);

    logger.info('✅ Menu categories and items created');
  }

  // ─── Sample Customer ───────────────────────────────────────────────────────

  const customerExists = await User.findOne({ email: 'customer@demo.com' });
  if (!customerExists) {
    await User.create({
      name: 'Ali Customer',
      email: 'customer@demo.com',
      phone: '+923009876543',
      passwordHash: await argon2.hash('Customer@123456'),
      role: 'customer',
      status: 'active',
      emailVerified: true,
    });
    logger.info('✅ Customer user created: customer@demo.com / Customer@123456');
  }

  // ─── Sample Rider ──────────────────────────────────────────────────────────

  const riderExists = await User.findOne({ email: 'rider@demo.com' });
  if (!riderExists) {
    await User.create({
      name: 'Ahmed Rider',
      email: 'rider@demo.com',
      phone: '+923005551234',
      passwordHash: await argon2.hash('Rider@123456'),
      role: 'rider',
      status: 'active',
      emailVerified: true,
    });
    logger.info('✅ Rider user created: rider@demo.com / Rider@123456');
  }

  await mongoose.disconnect();
  logger.info('🎉 Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
