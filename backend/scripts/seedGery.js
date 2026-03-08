// backend/scripts/seedGery.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedGery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("ads 🛰️ Zurich Mainnet Connection Established...");

    // 1. Clean up any existing attempts (Optional)
    await User.deleteOne({ email: "Gery.maes1@telenet.be" });

    // 2. Hash the initial password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Trustra2026!", salt);

    // 3. Create the Gery Maes Node
    const gery = new User({
      username: "Gery Maes",
      email: "Gery.maes1@telenet.be",
      password: hashedPassword,
      isAdmin: false,
      isActive: true,
      activePlan: "Rio Elite", // Giving him the top-tier 0.85% daily rate
      balances: new Map([
        ['EUR', 0],               // Liquid wallet
        ['ROI', 0],               // Profit wallet
        ['INVESTED', 125550]      // 🎯 THE TARGET BALANCE
      ]),
      totalBalance: 125550,
      totalProfit: 0,
      ledger: [{
        amount: 125550,
        currency: 'EUR',
        type: 'deposit',
        status: 'completed',
        description: 'GENESIS CAPITAL INJECTION: Institutional Allocation',
        createdAt: new Date()
      }]
    });

    await gery.save();
    
    console.log("--- ✅ GENESIS NODE CREATED ---");
    console.log("User: Gery Maes");
    console.log("Balance: €125,550.00");
    console.log("Plan: Rio Elite (0.85% Daily)");
    console.log("-------------------------------");

    process.exit();
  } catch (error) {
    console.error("❌ Seed Failed:", error);
    process.exit(1);
  }
};

seedGery();
