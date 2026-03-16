import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const setElite = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Applying Rio Elite Protocol Settings
    const update = {
      plan: 'Rio Elite',
      isNodeActive: true,
      miningStatus: 'active',
      dailyRoi: 0.06849, // (25% / 365 days)
      rioSettings: {
        tier: 'Elite',
        minApy: 20,
        maxApy: 25,
        autoCompound: true
      }
    };

    const user = await User.findOneAndUpdate(
      { email: 'Gery.maes1@telenet.be' },
      { $set: update },
      { new: true }
    );

    if (!user) throw new Error("User Gery not found.");

    console.log("💎 PROTOCOL ACTIVATED: Rio Elite");
    console.log(`👤 User: ${user.email}`);
    console.log(`📈 Daily Execution Rate: ${update.dailyRoi}%`);
    console.log(`📡 Status: Automated Yield Execution Active`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Protocol Sync Failed:", err.message);
    process.exit(1);
  }
};

setElite();
