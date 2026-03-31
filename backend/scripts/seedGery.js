// backend/scripts/seedGery.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedGery = async () => {
  try {
    console.log('📡 Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected');

    const email = 'Gery.maes1@telenet.be';
    const username = 'gerymaes';

    await User.deleteMany({ email });
    console.log(`🗑️  Cleared existing data for ${email}`);

    const gery = new User({
      name: 'Gery Maes',
      username: username,
      email: email,
      password: 'trustra2026', 
      phone: '+32474576142',
      role: 'user',
      isActive: true,
      isNodeActive: true,
      kycStatus: 'verified',
      activePlan: 'Rio Elite',
      // ONLY NUMBERS IN BALANCES TO MATCH SCHEMA
      balances: new Map([
        ['EUR', 125550],
        ['ROI', 8750],
        ['BTC', 0.45],
        ['ETH', 12.5],
        ['USDT', 5000],
        ['INVESTED', 116800]
      ]),
      totalBalance: 125550,
      totalProfit: 8750
    });

    await gery.save();
    
    console.log('------------------------------------');
    console.log('✅ Gery Maes Seeded Successfully');
    console.log('------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedGery();

