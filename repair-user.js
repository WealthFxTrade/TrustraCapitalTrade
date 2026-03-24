import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js'; // Ensure path is correct

dotenv.config();

const repairUser = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = "gery.maes1@telenet.be";
    const newPassword = "trustra2026"; // The password you want to use

    const user = await User.findOne({ email });

    if (!user) {
      console.error("❌ User not found in registry.");
      process.exit(1);
    }

    // This triggers the pre('save') hook in User.js to hash the password
    user.password = newPassword; 
    
    // Ensure required fields exist if they were missing
    if (!user.name) user.name = "Gery Maes";
    if (!user.phone) user.phone = "+4932474576142";

    await user.save();
    
    console.log(`✅ User ${email} repaired and password synchronized!`);
    console.log("🚀 You can now log in at the terminal.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Repair failed:", err.message);
    process.exit(1);
  }
};

repairUser();

