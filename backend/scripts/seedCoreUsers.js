/**
 * Trustra Capital Trade - Seed Core Users
 * Admin + Gery (VIP) ready for login & dashboard
 * Production-safe (March 2026)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const SALT_ROUNDS = 14;

// ✅ Only allow seeding in dev or explicitly via ALLOW_SEED
const ALLOW_SEED = process.env.NODE_ENV === 'development' || process.env.ALLOW_SEED === 'true';
if (!ALLOW_SEED) {
  console.error('❌ Seeding not allowed in this environment. Set NODE_ENV=development or ALLOW_SEED=true');
  process.exit(1);
}

const CORE_USERS = [
  {
    name: 'Trustra Admin',
    username: 'admin',
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
    username: 'gerymaes',
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

const seedCoreUsers = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not defined');

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected');

    for (const u of CORE_USERS) {
      // Remove existing
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
    console.log('🎉 Admin & Gery users are ready for login');
    console.log('------------------------------------');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedCoreUsers();
