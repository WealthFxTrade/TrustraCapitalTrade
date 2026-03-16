import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

dotenv.config();

const assignAddress = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Find Gery
    const user = await User.findOne({ email: 'Gery.maes1@telenet.be' });
    if (!user) throw new Error("User Gery not found.");

    // 2. Use your XPUB from .env to derive an address (Index 1 for Gery as a test)
    const xpub = process.env.BITCOIN_XPUB;
    if (!xpub) throw new Error("BITCOIN_XPUB is missing in .env");

    const newAddress = deriveBtcAddress(xpub, 1); // Deriving index 1
    
    // 3. Update User (Check if your schema uses btcAddress or walletAddress)
    user.btcAddress = newAddress; 
    user.walletAddress = newAddress; // Setting both to be safe
    await user.save();

    console.log("✅ SUCCESS: Assigned BTC Address to Gery");
    console.log("🔗 Address: " + newAddress);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

assignAddress();
