import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Find the most recent user
    const user = await User.findOne().sort({ createdAt: -1 }); 
    if (!user) throw new Error("No users found in database.");

    console.log("Testing credit for: " + user.email);

    const amountBtc = 0.05;
    const btcPriceEur = 62500;
    const amountEur = amountBtc * btcPriceEur;

    // Create the record
    await Deposit.create({
      user: user._id,
      amount: amountBtc,
      amountEUR: amountEur,
      currency: 'BTC',
      address: 'MOCK_TEST_ADDRESS',
      status: 'confirmed',
      locked: true
    });

    // Update User
    const currentEur = user.balances.get('EUR') || 0;
    user.balances.set('EUR', currentEur + amountEur);
    user.totalBalance += amountEur;

    user.ledger.push({
      amount: amountEur,
      currency: 'EUR',
      type: 'deposit',
      status: 'completed',
      description: "DEBUG: Mock BTC Deposit Confirmed"
    });

    user.markModified('balances');
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount: amountEur,
      currency: 'EUR',
      status: 'completed',
      method: 'crypto'
    });

    console.log("✅ SUCCESS: Credited " + user.email + " with €" + amountEur);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

runTest();
