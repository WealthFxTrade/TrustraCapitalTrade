// backend/cron/profitCron.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";

dotenv.config();

async function calculateProfits() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const transactions = await Transaction.find({ status: "active" });
    transactions.forEach(tx => {
      // Example: calculate some profit
      tx.profit = tx.amount * 0.01;
      console.log(`Transaction ${tx._id} profit calculated: ${tx.profit}`);
    });

    console.log("✅ Profits calculated successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

// Run this file directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  calculateProfits();
}

export default calculateProfits;
