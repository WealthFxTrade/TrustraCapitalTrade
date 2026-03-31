import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createGeryUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing user
    await User.deleteOne({ email: "Gery.maes1@telenet.be" });
    console.log('🗑️ Old Gery account removed');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("trustra2026", salt);

    const newUser = new User({
      name: "Gery Maes",
      username: "gery_maes",
      email: "Gery.maes1@telenet.be",
      phone: "+32474576142",
      password: hashedPassword,
      role: "user",
      isActive: true,
      kycStatus: "unsubmitted",
      // Explicitly set to avoid unique constraint on null
      btcDepositAddress: undefined,
      lastBtcIndex: 100,
      balances: new Map([
        ['EUR', 125550],
        ['ROI', 9817],
        ['BTC', 0],
        ['ETH', 0],
        ['USDT', 0],
        ['INVESTED', 0],
        ['LOCKED', 0]
      ]),
      totalBalance: 125550,
      realizedProfit: 9817
    });

    await newUser.save();

    console.log("✅ Gery Maes account created successfully!");
    console.log("Email    :", newUser.email);
    console.log("Username :", newUser.username);
    console.log("Password :", "trustra2026");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
};

createGeryUser();
