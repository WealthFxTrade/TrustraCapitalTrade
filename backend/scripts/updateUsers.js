import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const updateUsers = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.updateMany(
      {}, 
      { $set: { realizedProfit: 0, lastBtcIndex: 100 } }
    );

    console.log(`✅ Success! Updated ${result.modifiedCount} users.`);
    console.log('   (realizedProfit and lastBtcIndex are now set)');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

updateUsers();
