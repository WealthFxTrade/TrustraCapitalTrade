import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js'; // make sure this exists

dotenv.config();

// =====================
// MongoDB connection
// =====================
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ MONGO_URI not set in environment variables');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected for profit cron'))
  .catch(err => {
    console.error('❌ MongoDB connection error for cron:', err);
    process.exit(1);
  });

// =====================
// Daily profit update function
// =====================
const updateProfits = async () => {
  try {
    const users = await User.find({ plan: { $ne: 'None' } });
    const today = new Date();
    let updatedCount = 0;

    for (const user of users) {
      const daysSinceLastUpdate = Math.floor((today - user.lastProfitUpdate) / (1000 * 60 * 60 * 24));
      if (daysSinceLastUpdate > 0 && user.balance > 0 && user.dailyRate > 0) {
        const dailyProfit = user.balance * user.dailyRate * daysSinceLastUpdate;

        if (dailyProfit > 0) {
          user.balance += dailyProfit;
          user.lastProfitUpdate = today;

          // Log profit as a transaction
          await Transaction.create({
            user: user._id,
            type: 'profit',
            amount: dailyProfit,
            description: `Daily profit accrual (${user.plan})`,
          });

          await user.save();
          updatedCount++;
        }
      }
    }

    console.log(`✅ Daily profits updated and logged for ${updatedCount} users at ${today.toISOString()}`);
  } catch (err) {
    console.error('❌ Profit cron error:', err);
  }
};

// =====================
// Cron schedule: daily at midnight
// =====================
// Format: second (optional) minute hour day-of-month month day-of-week
cron.schedule('0 0 * * *', () => {
  console.log('🕛 Running daily profit cron job...');
  updateProfits();
});
