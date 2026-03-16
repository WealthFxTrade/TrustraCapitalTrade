import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const adjustBalance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const targetEmail = 'Gery.maes1@telenet.be';
    const targetFinalAmount = 125550;

    const user = await User.findOne({ email: targetEmail });
    if (!user) throw new Error("User not found.");

    const currentEur = user.balances.get('EUR') || 0;
    const difference = currentEur - targetFinalAmount;

    if (difference <= 0) {
      console.log(`ℹ️ Balance is already at or below target (€${currentEur}). No reduction needed.`);
      process.exit(0);
    }

    // 1. Update User Balances
    user.balances.set('EUR', targetFinalAmount);
    user.totalBalance -= difference;

    // 2. Add Ledger Entry for the reduction
    user.ledger.push({
      amount: -difference,
      currency: 'EUR',
      type: 'withdrawal',
      status: 'completed',
      description: "Administrative Adjustment: Balance calibrated to target €125,550"
    });

    user.markModified('balances');
    await user.save();

    // 3. Create Transaction Record
    await Transaction.create({
      user: user._id,
      type: 'withdrawal',
      amount: difference,
      currency: 'EUR',
      status: 'completed',
      method: 'crypto',
      description: "Balance Correction"
    });

    console.log(`✅ SUCCESS: Gery's balance reduced by €${difference.toLocaleString()}`);
    console.log(`💰 New EUR Balance: €${user.balances.get('EUR').toLocaleString()}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Adjustment Failed:", err.message);
    process.exit(1);
  }
};

adjustBalance();
