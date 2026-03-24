import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Fix for ES Modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to the .env file in the parent directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const finalSeed = async () => {
  try {
    console.log("🛰️  Connecting to Trustra Registry...");
    
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is missing. Check if .env exists in ~/TrustraCapitalTrade/");
    }

    await mongoose.connect(uri);
    console.log("📡  Connected to MongoDB Cluster.");

    const email = "Gery.maes1@telenet.be";
    const username = "gery_maes";
    
    // Purge old data to prevent Duplicate Key errors
    await User.deleteMany({ 
        $or: [{ email: email }, { username: username }] 
    });
    console.log("🗑️  Previous node records purged.");

    /**
     * PASS PLAIN TEXT PASSWORD
     * User.js pre('save') hook will handle the hashing.
     */
    const gery = new User({
      name: "Gery Maes",
      username: username,
      email: email,
      password: "trustra2026", 
      phone: "+32474576142",
      role: "user",
      isActive: true,
      isNodeActive: true,
      kycStatus: "verified",
      activePlan: "Rio Elite",
      balances: {
        EUR: 125550,
        ROI: 8750,
        BTC: 0.45,
        ETH: 12.5,
        USDT: 5000,
        INVESTED: 125550,
      },
      totalBalance: 125550,
      totalProfit: 8750,
    });

    await gery.save();

    console.log("\n✅ GERY NODE INITIALIZED SUCCESSFULLY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email     : ${email}`);
    console.log("Password  : trustra2026");
    console.log("Balance   : €125,550.00");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("IMPORTANT: Clear LocalStorage in your browser before logging in.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Protocol Failed:", error.message);
    process.exit(1);
  }
};

finalSeed();

