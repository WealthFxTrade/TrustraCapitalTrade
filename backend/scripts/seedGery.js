import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

// Explicitly load the correct env file
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env'
});

const seedGery = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
    if (!process.env.BTC_XPUB) throw new Error("BTC_XPUB is missing");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = 'gery.maes1@telenet.be';

    // Remove existing user
    await User.deleteOne({ email });
    console.log(`⚠️ Removed existing user: ${email}`);

    // Get next wallet index
    const lastUser = await User.findOne().sort({ address_index: -1 });
    const nextIndex = lastUser && lastUser.address_index !== undefined ? lastUser.address_index + 1 : 0;

    // Derive BTC address
    const { address } = deriveBtcAddress(nextIndex);
    console.log(`🔑 Derived Unique BTC Address: ${address} (Index: ${nextIndex})`);

    // ── CREATE USER WITH CORRECT MAP TYPES ──
    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      address_index: nextIndex,
      activePlan: 'Sovereign',

      // ✅ BALANCES: ONLY NUMBERS
      balances: new Map([
        ['EUR', 125550],
        ['BTC', 0.45],
        ['USDT', 5000],
        ['ROI', 12.5],
        ['INVESTED', 110000]
      ]),

      // ✅ WALLET ADDRESSES: STRINGS (WHERE BTC_ADDRESS BELONGS)
      walletAddresses: new Map([
        ['BTC', address],
        ['ETH', '']
      ])
    });

    console.log("✅ PRINCIPAL PROVISIONED SUCCESSFULLY");
    console.log(`👤 Name: ${gery.name}`);
    console.log(`💰 BTC Wallet: ${gery.btcAddress}`); // Works via virtual in User.js

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Failed:", error.message);
    process.exit(1);
  }
};

seedGery();

