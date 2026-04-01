import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not defined');

    console.log('📡 Connecting to MongoDB for admin seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected');

    const adminEmail = 'www.infocare@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`⚠️ Admin already exists. Skipping creation: ${adminEmail}`);
    } else {
      const hashedPassword = await bcrypt.hash('admintrustra2026', 12);

      const admin = new User({
        name: 'TRUSTRA Admin',
        username: 'trustradmin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+1 (878) 224-1625',
        role: 'admin',
        isActive: true,
        isNodeActive: true,
        kycStatus: 'verified',
        balances: new Map([
          ['EUR', 0],
          ['ROI', 0],
          ['BTC', 0],
          ['ETH', 0],
          ['USDT', 0],
          ['INVESTED', 0]
        ]),
        totalBalance: 0,
        totalProfit: 0
      });

      await admin.save();
      console.log('✅ Admin user created successfully with email:', adminEmail);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
    process.exit(1);
  }
};

createAdmin();
