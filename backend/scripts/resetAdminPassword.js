import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: "www.infocare@gmail.com" });

    if (!user) {
      console.log("❌ User with email www.infocare@gmail.com not found.");
      return;
    }

    // Hash the password correctly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admintrustra2026", salt);

    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password successfully reset for admin account!");
    console.log("Username :", user.username);
    console.log("Email    :", user.email);
    console.log("Role     :", user.role);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

resetPassword();
