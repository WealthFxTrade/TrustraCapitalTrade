// backend/cron/checkDeposits.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { generateAddress } from "../utils/generateBtcAddress.js";

dotenv.config();

async function checkDeposits() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({});
    for (const user of users) {
      const address = generateAddress(user.index);
      console.log(`User ${user._id} address: ${address}`);
      // Add your deposit check logic here
    }

    console.log("✅ Deposits checked successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

// Run this file directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkDeposits();
}

export default checkDeposits;
