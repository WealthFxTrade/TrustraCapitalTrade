import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';

dotenv.config();

const createPending = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: 'Gery.maes1@telenet.be' });
    if (!user) throw new Error("Gery not found");

    // Create a deposit that the WATCHER will "see"
    await Deposit.create({
      user: user._id,
      amount: 0.25, // 0.25 BTC
      currency: 'BTC',
      address: 'bc1q3g338hggu6jd7hx7ccv9s0qg76c44deerksvt9',
      status: 'pending',
      locked: false
    });

    console.log("📡 SUCCESS: Pending 0.25 BTC deposit created for Gery.");
    console.log("⏰ The [WATCHER] will attempt to confirm this in its next cycle.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

createPending();
