import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const runCredit = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to Trustra Mainnet...");

    const targetEmail = 'Gery.maes1@telenet.be';
    const amountEur = 125550;

    // 1. Locate User
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      throw new Error("User " + targetEmail + " not found in database.");
    }

    // 2. Create Deposit Record
    await Deposit.create({
      user: user._id,
      amount: 0,
      amountEUR: amountEur,
      currency: 'EUR',
      address: 'MANUAL_ADMIN_CREDIT',
      status: 'confirmed',
      locked: true
    });

    // 3. Update Balances
    const currentEur = user.balances.get('EUR') || 0;
    user.balances.set('EUR', currentEur + amountEur);
    user.totalBalance += amountEur;

    // 4. Update Ledger
    user.ledger.push({
      amount: amountEur,
      currency: 'EUR',
      type: 'deposit',
      status: 'completed',
      description: "Institutional Credit: Manual EUR Adjustment"
    });

    user.markModified('balances');
    await user.save();

    // 5. Create Transaction Record
    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount: amountEur,
      currency: 'EUR',
      status: 'completed',
      method: 'crypto'
    });

    console.log("✅ SUCCESS: Credited " + targetEmail + " with €" + amountEur.toLocaleString());
    process.exit(0);
  } catch (err) {
    console.error("❌ Credit Failed:", err.message);
    process.exit(1);
  }
};

runCredit();
