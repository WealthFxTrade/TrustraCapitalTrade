import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createFreshAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteOne({ email: "www.infocare@gmail.com" });

    const newAdmin = new User({
      name: "Admin User",
      username: "infocare_admin",
      email: "www.infocare@gmail.com",
      phone: "08000000000",
      password: "admintrustra2026", // ✅ plain (model will hash)
      role: "admin",
      isActive: true,
      kycStatus: "verified",
      balances: new Map([
        ['EUR', 50000],
        ['ROI', 9817],
        ['BTC', 0],
        ['ETH', 0],
        ['USDT', 0],
        ['INVESTED', 0],
        ['LOCKED', 0]
      ]),
      totalBalance: 59817,
      realizedProfit: 9817
    });

    await newAdmin.save();

    console.log("🎉 ADMIN CREATED SUCCESSFULLY!");
    console.log("Email:", "www.infocare@gmail.com");
    console.log("Password:", "admintrustra2026");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createFreshAdmin();
