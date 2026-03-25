import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const forceAdmin = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB');

    const result = await User.findOneAndUpdate(
      { email: "www.infocare@gmail.com" },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (result) {
      console.log("✅ SUCCESS! User is now ADMIN");
      console.log("Username :", result.username);
      console.log("Email    :", result.email);
      console.log("Role     :", result.role);
      console.log("ID       :", result._id);
    } else {
      console.log("❌ User with email 'www.infocare@gmail.com' was NOT found.");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

forceAdmin();
