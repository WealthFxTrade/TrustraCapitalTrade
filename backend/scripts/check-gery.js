import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'Gery.maes1@telenet.be' });
    
    if (!user) {
      console.log("❌ User 'Gery.maes1@telenet.be' not found.");
    } else {
      console.log("------------------------------------------");
      console.log("👤 User: " + user.email);
      console.log("💰 EUR Balance: €" + (user.balances.get('EUR') || 0).toLocaleString());
      console.log("₿ BTC Balance: " + (user.balances.get('BTC') || 0) + " BTC");
      
      // Check for common address field names in your schema
      const btcAddress = user.btcAddress || user.walletAddress || "No address assigned yet";
      console.log("🔗 Assigned BTC Address: " + btcAddress);
      console.log("------------------------------------------");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Database Error:", err.message);
    process.exit(1);
  }
};

checkUser();
