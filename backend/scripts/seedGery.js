// scripts/seedGery.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedGery = async () => {
  try {
    console.log("📡 Establishing secure connection for Principal Provisioning...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Secure Database Connection Established");

    const email = 'gery.maes1@telenet.be';
    
    // 1. REVOKE EXISTING ACCESS (Clean start to ensure fresh hashing)
    await User.deleteOne({ email });
    console.log(`⚠️ Identity collision detected. Revoking existing access: ${email}`);

    // 2. PROVISION NEW PRINCIPAL
    // We use .create() because it triggers the pre('save') hook in User.js
    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026', // This WILL be hashed by User.js pre-save hook
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      balances: new Map([
        ['EUR', 125550],
        ['BTC', 0.45],
        ['USDT', 5000],
        ['ROI', 12.5],
        ['INVESTED', 110000]
      ]),
      activePlan: 'Sovereign'
    });

    console.log("────────────────────────────────────────────────");
    console.log(`✅ PRINCIPAL PROVISIONED: ${gery.name}`);
    console.log(`🔐 Access Key: trustra2026`);
    console.log(`📈 Strategy: Class V: Sovereign`);
    console.log(`💰 NAV: €${gery.balances.get('EUR').toLocaleString()}`);
    console.log("────────────────────────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error(`❌ PROVISIONING FAILED: ${error.message}`);
    process.exit(1);
  }
};

seedGery();
