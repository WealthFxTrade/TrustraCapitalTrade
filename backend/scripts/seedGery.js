// scripts/seedGery.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env' });

const seedGery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = 'gery.maes1@telenet.be';

    await User.deleteOne({ email });
    console.log(`⚠️ Removed existing user: ${email}`);

    const gery = await User.create({
      name: 'Gery Maes',
      email,
      password: 'trustra2026',  // Will be hashed by pre-save hook
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      balances: new Map([
        ['EUR', 125550],
        ['BTC', 0.45],
        ['USDT', 5000],
        ['ROI', 12.5],
        ['INVESTED', 110000]
      ]),
      activePlan: 'Sovereign'
    });

    console.log(`✅ PRINCIPAL PROVISIONED: ${gery.name} | Password: trustra2026`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Failed:", err);
    process.exit(1);
  }
};

seedGery();
