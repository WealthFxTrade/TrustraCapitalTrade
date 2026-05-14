import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Commented out to allow explicit deployment runtime injection overrides
// dotenv.config();

const checkUser = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI environment variable is missing.");

    await mongoose.connect(process.env.MONGO_URI);
    
    // The User model automatically lowers the lookup string because of lowercase: true
    const user = await User.findOne({ email: 'gery.maes1@telenet.be' });

    if (!user) {
      console.log("❌ User 'gery.maes1@telenet.be' not found in this cluster namespace.");
    } else {
      console.log("------------------------------------------");
      console.log("👤 User Document Located: " + user.email);
      console.log("🔒 KYC Validation State:  " + (user.kycStatus || "Not verified"));
      console.log("🟢 Platform Active State: " + (user.isActive ? "Yes" : "No"));
      console.log("------------------------------------------");
      
      // Fixed: Directly parsing nested object variables safely
      const eurBalance = user.balances?.EUR ?? 0;
      const btcBalance = user.balances?.BTC ?? 0;
      const ethBalance = user.balances?.ETH ?? 0;
      const usdtBalance = user.balances?.USDT ?? 0;
      
      console.log("💰 EUR Balance : €" + eurBalance.toLocaleString('de-DE'));
      console.log("🪙 BTC Balance : " + btcBalance + " BTC");
      console.log("🪙 ETH Balance : " + ethBalance + " ETH");
      console.log("🪙 USDT Balance: " + usdtBalance + " USDT");

      // Fixed: Accessing structural wallet fields accurately 
      const btcAddress = user.walletAddresses?.BTC || "No address assigned yet";
      const ethAddress = user.walletAddresses?.ETH || "No address assigned yet";
      
      console.log("🔗 Assigned BTC Address: " + btcAddress);
      console.log("🔗 Assigned ETH Address: " + ethAddress);
      console.log("------------------------------------------");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Database Error:", err.message);
    process.exit(1);
  }
};

checkUser();

