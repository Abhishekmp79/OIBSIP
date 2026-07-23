/**
 * Seed script.
 *
 * Run with:  npm run seed   (inside /server)
 *
 *  - Connects to MongoDB
 *  - Upserts the default inventory rows (bases, sauces, cheeses, vegetables)
 *  - Creates a default admin account from env (idempotent)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Inventory = require('../models/Inventory');
const User = require('../models/User');

const SEED_ITEMS = [
  // Bases
  { name: 'Sourdough', category: 'base', quantity: 40, threshold: 10, unit: 'bases' },
  { name: 'Classic', category: 'base', quantity: 50, threshold: 12, unit: 'bases' },
  { name: 'Thin & Crispy', category: 'base', quantity: 35, threshold: 10, unit: 'bases' },
  { name: 'Whole Wheat', category: 'base', quantity: 30, threshold: 8, unit: 'bases' },
  { name: 'Gluten-free', category: 'base', quantity: 20, threshold: 6, unit: 'bases' },
  // Sauces
  { name: 'San Marzano', category: 'sauce', quantity: 45, threshold: 10, unit: 'portions' },
  { name: 'Spicy Arrabbiata', category: 'sauce', quantity: 38, threshold: 10, unit: 'portions' },
  { name: 'Garlic Cream', category: 'sauce', quantity: 30, threshold: 8, unit: 'portions' },
  { name: 'Pesto Verde', category: 'sauce', quantity: 25, threshold: 8, unit: 'portions' },
  { name: 'No Sauce', category: 'sauce', quantity: 999, threshold: 0, unit: 'portions' },
  // Cheeses
  { name: 'Fior di latte', category: 'cheese', quantity: 40, threshold: 10, unit: 'portions' },
  { name: 'Burrata', category: 'cheese', quantity: 22, threshold: 8, unit: 'portions' },
  { name: 'Smoked Scamorza', category: 'cheese', quantity: 28, threshold: 8, unit: 'portions' },
  { name: 'Vegan Mozzarella', category: 'cheese', quantity: 18, threshold: 6, unit: 'portions' },
  // Vegetables
  { name: 'Basil', category: 'vegetable', quantity: 40, threshold: 10, unit: 'toppings' },
  { name: 'Mushroom', category: 'vegetable', quantity: 36, threshold: 10, unit: 'toppings' },
  { name: 'Roasted Pepper', category: 'vegetable', quantity: 30, threshold: 10, unit: 'toppings' },
  { name: 'Red Onion', category: 'vegetable', quantity: 34, threshold: 10, unit: 'toppings' },
  { name: 'Jalapeno', category: 'vegetable', quantity: 28, threshold: 8, unit: 'toppings' },
  { name: 'Black Olive', category: 'vegetable', quantity: 24, threshold: 8, unit: 'toppings' },
];

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@slicehouse.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[SEED] admin already exists: ${email}`);
    return;
  }
  await User.create({
    fullName: process.env.ADMIN_NAME || 'Slice House Admin',
    email,
    phone: '0000000000',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    verified: true,
  });
  console.log(`[SEED] admin created: ${email} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
}

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slice_house';
  await mongoose.connect(MONGO_URI);
  console.log('[SEED] connected to MongoDB');

  for (const item of SEED_ITEMS) {
    await Inventory.findOneAndUpdate(
      { name: item.name, category: item.category },
      { $set: item },
      { upsert: true, new: true }
    );
  }
  console.log(`[SEED] upserted ${SEED_ITEMS.length} inventory items`);

  await seedAdmin();

  await mongoose.connection.close();
  console.log('[SEED] done. DB connection closed.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[SEED] failed:', err);
  process.exit(1);
});
