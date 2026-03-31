// backend/scripts/fixAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const fixAdmin = async () => {
  try {
    console.log('📡 Connecting to MongoDB for Admin fix...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected');

    // FIX: Drop the unique username index that is causing the null conflict
    try {
      await User.collection.dropIndex('username_1');
      console.log('🗑️  Dropped old username index to fix null conflict');
    } catch (err) {
      console.log('ℹ️  No existing username index to drop or already cleared');
    }

    const email = 'www.infocare@gmail.com';
    const rawPassword = 'admintrustra2026';

    // 1. Remove any existing entry with this email
    await User.deleteMany({ email });
    console.log(`🗑️  Cleared existing records for ${email}`);

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // 3. Create the privileged Admin account
    const admin = new User({
      name: 'Trustra Master Admin',
      username: 'trustra_admin_main', // Ensure this is a unique string
      email: email,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isNodeActive: true,
      kycStatus: 'verified',
      balances: new Map([
        ['EUR', 0],
        ['ROI', 0]
      ])
    });

    await admin.save();

    console.log('------------------------------------');
    console.log('✅ ADMIN ACCESS RESTORED');
    console.log(`User: ${email}`);
    console.log('Role: MASTER ADMIN');
    console.log('------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Admin fix failed:', error.message);
    process.exit(1);
  }
};

fixAdmin();

