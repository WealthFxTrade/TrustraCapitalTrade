import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const recreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing account if it exists
    await User.deleteOne({ email: "www.infocare@gmail.com" });
    console.log('🗑️ Old account deleted (if existed)');

    // Create new admin account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admintrustra2026", salt);

    const newAdmin = new User({
      name: "Admin User",
      username: "infocare_admin",
      email: "www.infocare@gmail.com",
      phone: "0000000000",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      kycStatus: "verified",
      balances: new Map([
        ['EUR', 0],
        ['ROI', 0],
        ['BTC', 0],
        ['ETH', 0],
        ['USDT', 0],
        ['INVESTED', 0],
        ['LOCKED', 0]
      ]),
      totalBalance: 0,
      realizedProfit: 0
    });

    await newAdmin.save();

    console.log("✅ NEW ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    console.log("Email    :", newAdmin.email);
    console.log("Username :", newAdmin.username);
    console.log("Role     :", newAdmin.role);
    console.log("Password :", "admintrustra2026");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

recreateAdmin();
