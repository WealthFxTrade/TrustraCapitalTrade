// scripts/resetProductionUsers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const resetUsers = async () => {
  try {
    // Ensure MONGO_URI exists in your .env
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Connected to Trustra Database...');

    const targetEmails = [
      'www.infocare@gmail.com',
      'gery.maes1@telenet.be'
    ];

    // Delete accounts (case-insensitive search)
    const result = await User.deleteMany({ 
      email: { $in: targetEmails.map(e => e.toLowerCase()) } 
    });

    console.log(`✅ Cleaned ${result.deletedCount} problematic accounts.`);
    console.log('🚀 Step 2: Restart your server and login normally via the web UI.');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
};

resetUsers();

