// backend/scripts/seedGery.js - FINAL RESET WITH YOUR EXACT PASSWORD

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const finalSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🛰️  Connected to MongoDB...");

    // Delete any existing Gery account
    await User.deleteOne({ email: "Gery.maes1@telenet.be" });
    console.log("🗑️  Old account deleted");

    // Use EXACTLY the password you want
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("trustra2026", salt);

    const gery = new User({
      name: "Gery Maes",
      username: "gery_maes",
      email: "Gery.maes1@telenet.be",
      password: hashedPassword,
      phone: "+32495123456",
      isActive: true,
      activePlan: "Rio Elite",
      balances: new Map([
        ['EUR', 125550],
        ['ROI', 8750],
        ['INVESTED', 125550],
        ['LOCKED', 0]
      ]),
      totalBalance: 125550,
      totalProfit: 8750,
    });

    await gery.save();

    console.log("✅ GERY ACCOUNT CREATED WITH YOUR PASSWORD");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email     : Gery.maes1@telenet.be");
    console.log("Password  : trustra2026");
    console.log("Balance   : €125,550");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("You can now log in with these exact credentials.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Failed:", error.message);
    process.exit(1);
  }
};

finalSeed();
