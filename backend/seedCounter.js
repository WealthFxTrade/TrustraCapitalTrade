// backend/seedCounter.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const counterExists = await User.findOne({ isCounter: true });
    
    if (!counterExists) {
      await User.create({
        fullName: "SYSTEM_COUNTER",
        email: "system@trustra.internal",
        password: "INTERNAL_CORE_NODE_SYNC_PROTECTED",
        isCounter: true,
        btcIndexCounter: 0
      });
      console.log('✅ Global Wallet Counter Initialized.');
    } else {
      console.log('ℹ️ Global Wallet Counter already active.');
    }
    
    process.exit();
  } catch (err) {
    console.error('❌ Initialization failed:', err);
    process.exit(1);
  }
};

seed();
