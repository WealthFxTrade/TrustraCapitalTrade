import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createFreshAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete any existing account
    const deleteResult = await User.deleteOne({ email: "www.infocare@gmail.com" });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old account(s)`);

    // Create brand new admin with properly hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admintrustra2026", salt);

    const newAdmin = new User({
      name: "Admin User",
      username: "infocare_admin",
      email: "www.infocare@gmail.com",
      phone: "08000000000",
      password: hashedPassword,
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

    console.log("🎉 NEW ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    console.log("Email    : www.infocare@gmail.com");
    console.log("Username : infocare_admin");
    console.log("Password : admintrustra2026");
    console.log("Role     : admin");
    console.log("Total Balance : €59,817");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createFreshAdmin();
