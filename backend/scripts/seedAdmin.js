// scripts/seedAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Resolve paths for the custom .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛠️ LOAD THE SPECIFIC ENV FILE
dotenv.config({ path: path.join(__dirname, '../.env.development') });

const run = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MONGO_URI is not defined. Check your .env.development file path.');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');

    // These must be in your .env.development or hardcoded here for one-time use
    const email = process.env.ADMIN_EMAIL || 'admin@trustracapitaltrade.online';
    const password = process.env.ADMIN_PASSWORD || 'Kayblizz2015'; // Using your DB pass as placeholder

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin already exists →', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: 'System Administrator',
      email,
      password: hashed,
      role: 'admin',
      isVerified: true,
      isActive: true,
      balances: {
        BTC: 0,
        ETH: 0,
        EUR: 0,
        INVESTED: 0,
        TOTAL_PROFIT: 0
      }
    });

    console.log('🎉 Admin created successfully:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

run();

