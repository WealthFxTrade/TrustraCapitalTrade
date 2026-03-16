import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const forceConfirm = async () => {
  try {
    console.log("Step 1: Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Step 1: Connected.");

    // Manually setting the price to bypass the Binance timeout
    const btcPriceEur = 63500; 
    console.log(`Step 2: Using Manual Price: €${btcPriceEur}`);

    console.log("Step 3: Finding Gery's pending deposit...");
    const deposit = await Deposit.findOne({ 
      address: 'bc1q3g338hggu6jd7hx7ccv9s0qg76c44deerksvt9', 
      status: 'pending' 
    });

    if (!deposit) {
       console.log("❌ Error: Pending deposit not found. Run mock-pending.js first!");
       process.exit(1);
    }

    console.log("Step 4: Executing Final Credit...");
    deposit.locked = true;
    deposit.amountEUR = deposit.amount * btcPriceEur;
    deposit.status = 'confirmed';
    deposit.confirmations = 3;
    await deposit.save();

    const user = await User.findById(deposit.user);
    if (user) {
      const currentEur = user.balances.get('EUR') || 0;
      const currentBtc = user.balances.get('BTC') || 0;

      user.balances.set('EUR', currentEur + deposit.amountEUR);
      user.balances.set('BTC', currentBtc + deposit.amount);
      user.totalBalance += deposit.amountEUR;

      user.ledger.push({
        amount: deposit.amountEUR,
        currency: 'EUR',
        type: 'deposit',
        status: 'completed',
        description: `OFFLINE SYNC: 0.25 BTC Confirmed @ €${btcPriceEur.toLocaleString()}`
      });

      user.markModified('balances');
      await user.save();

      await Transaction.create({
        user: user._id,
        type: 'deposit',
        amount: deposit.amountEUR,
        currency: 'EUR',
        status: 'completed',
        method: 'crypto'
      });

      console.log(`✅ SUCCESS: Force-confirmed 0.25 BTC for ${user.email}`);
      console.log(`💰 Added €${deposit.amountEUR.toLocaleString()} to balance.`);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ CRITICAL ERROR:", err.message);
    process.exit(1);
  }
};

forceConfirm();
