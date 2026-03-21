// backend/scripts/credit-user.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const emailToUpdate = "Gery.maes1@telenet.be";
const targetEur = 125550.00;  // exact amount you want

const setUserBalance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Zurich Mainnet → Connected");

    const user = await User.findOne({ email: emailToUpdate });

    if (!user) {
      console.log(`❌ User ${emailToUpdate} not found`);
      process.exit(1);
    }

    console.log(`Found user: \( {user.username || '—'} ( \){user._id})`);
    const currentEur = user.balances?.get('EUR') || 0;
    console.log(`Current EUR balance: €${currentEur.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`);

    // SET the EUR balance to exact target
    user.balances.set('EUR', targetEur);

    // Adjust totalBalance proportionally (if used)
    const diff = targetEur - currentEur;
    user.totalBalance = (user.totalBalance || 0) + diff;

    // Add ledger entry with VALID enum value
    user.ledger.push({
      amount: diff,
      currency: 'EUR',
      type: 'deposit',                          // ← fixed: valid enum value
      status: 'completed',
      description: `ADMIN_MANUAL_CREDIT – Set EUR balance to €\( {targetEur.toLocaleString('de-DE')} (net adjustment \){diff >= 0 ? '+' : ''}${diff.toFixed(2)})`,
      createdAt: new Date(),
    });

    await user.save();

    console.log("──────────────────────────────────────────────");
    console.log("✅ SUCCESS – Balance SET to exact target");
    console.log(`New EUR balance: €${targetEur.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`);
    console.log(`Total balance:   €${(user.totalBalance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`);
    console.log("Ledger adjustment entry added.");
    console.log("──────────────────────────────────────────────");

    process.exit(0);
  } catch (err) {
    console.error("❌ Operation failed:", err.message);
    process.exit(1);
  }
};

setUserBalance();
