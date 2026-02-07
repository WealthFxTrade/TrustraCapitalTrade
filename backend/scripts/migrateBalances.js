import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const migrateData = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://TrustraCapitalFx:Kayblizz2015@trustracapitalfx.w2mghdv.mongodb.net/TrustraCapitalTrade?retryWrites=true&w=majority&appName=TrustraCapitalFx";
    
    await mongoose.connect(uri);
    console.log("🚀 Connected to database for Euro & Name migration...");

    const users = await User.find({});
    let updateCount = 0;

    for (const user of users) {
      let isChanged = false;

      // 1. Fix the Name validation error
      // If fullName is missing, use the username or email prefix
      if (!user.fullName) {
        user.fullName = user.username || user.email.split('@')[0];
        isChanged = true;
      }

      // 2. Fix the Balance migration
      const oldBalance = user.get('balance');
      if (typeof oldBalance === 'number') {
        if (!user.balances) user.balances = new Map();
        
        user.balances.set('EUR', oldBalance);
        user.balances.set('BTC', 0);
        user.balances.set('USDT', 0);

        user.set('balance', undefined); // Remove old field
        user.markModified('balances');
        isChanged = true;
      }

      // 3. Ensure depositAddresses is initialized for the BTC fix
      if (!user.depositAddresses) {
        user.depositAddresses = new Map();
        isChanged = true;
      }

      if (isChanged) {
        await user.save();
        console.log(`✅ Fixed User: ${user.username || user.email}`);
        updateCount++;
      }
    }

    console.log(`\n✨ Success! ${updateCount} users fully migrated and validated.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateData();

