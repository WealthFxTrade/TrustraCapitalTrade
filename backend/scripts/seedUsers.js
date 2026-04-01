/**
 * Trustra Capital Trade - Seed Admin & Gery
 * Production-ready, 2026
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const SALT_ROUNDS = 14;
const ALLOW_SEED = process.env.NODE_ENV === 'development' || process.env.ALLOW_SEED === 'true';

if (!ALLOW_SEED) {
  console.error('❌ Seeding not allowed in this environment. Set NODE_ENV=development or ALLOW_SEED=true');
  process.exit(1);
}

const usersToSeed = [
  {
    name: 'Trustra Admin',
    email: 'www.infocare@gmail.com',
    password: 'admintrustra2026',
    role: 'admin',
    isActive: true,
    kycStatus: 'verified',
    balances: new Map([
      ['EUR', 0],
      ['ROI', 0],
      ['BTC', 0],
      ['ETH', 0],
      ['USDT', 0],
      ['INVESTED', 0],
    ]),
    totalBalance: 0,
    totalProfit: 0,
  },
  {
    name: 'Gery Maes',
    email: 'gery.maes1@telenet.be',
    password: 'trustra2026',
    role: 'user',
    isActive: true,
    isNodeActive: true,
    kycStatus: 'verified',
    activePlan: 'Rio Elite',
    balances: new Map([
      ['EUR', 125550],
      ['ROI', 8750],
      ['BTC', 0.45],
      ['ETH', 12.5],
      ['USDT', 5000],
      ['INVESTED', 116800],
    ]),
    totalBalance: 125550,
    totalProfit: 8750,
  },
];

const seedUsers = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not defined');

    console.log('📡 Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected');

    for (const u of usersToSeed) {
      // Remove existing user
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        await User.deleteOne({ email: u.email });
        console.log(`🗑️ Cleared existing data for ${u.email}`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);

      // Save user
      const userDoc = new User({
        ...u,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await userDoc.save();
      console.log(`✅ ${u.name} seeded successfully`);
    }

    console.log('------------------------------------');
    console.log('🎉 All users seeded successfully');
    console.log('------------------------------------');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedUsers();
