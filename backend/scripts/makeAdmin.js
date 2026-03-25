import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    });
    
    console.log('✅ MongoDB Connected');

    const result = await User.findOneAndUpdate(
      { email: "www.infocare@gmail.com" },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (result) {
      console.log("✅ SUCCESS! Role updated to ADMIN");
      console.log("Username :", result.username);
      console.log("Email    :", result.email);
      console.log("Role     :", result.role);
    } else {
      console.log("❌ User with email 'www.infocare@gmail.com' was NOT found.");
      console.log("Please check if the account exists in your database.");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

makeAdmin();
