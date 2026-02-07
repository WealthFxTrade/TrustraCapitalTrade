import cron from 'node-cron';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * @desc    Automated Daily ROI Distribution for 2026
 * Schedule: Runs every day at 00:00 (Midnight)
 */
const distributeDailyROI = async () => {
  const session = await mongoose.startSession();
  console.log(`[TRUSTRA_NODE] ROI Distribution started: ${new Date().toISOString()}`);

  try {
    session.startTransaction();

    // 1. Find all users with an active plan
    const investors = await User.find({ isPlanActive: true }).session(session);

    for (const user of investors) {
      // 2. Determine ROI based on current plan logic
      // Example: Starter (0.8%), Silver (1.2%), Gold (1.8%), etc.
      let dailyRate = 0;
      if (user.plan === 'Starter') dailyRate = 0.008;
      else if (user.plan === 'Silver') dailyRate = 0.012;
      else if (user.plan === 'Gold') dailyRate = 0.018;
      else if (user.plan === 'Platinum') dailyRate = 0.025;
      else if (user.plan === 'Diamond') dailyRate = 0.035;

      // 3. Calculate profit amount (based on user's current invested balance)
      const investedAmount = user.balances.get('USD_INVESTED') || 0;
      const profitAmount = Number((investedAmount * dailyRate).toFixed(2));

      if (profitAmount > 0) {
        // 4. Update Profit Wallet & Ledger
        user.totalProfit += profitAmount;
        user.ledger.push({
          amount: profitAmount,
          type: 'roi_profit',
          status: 'completed',
          description: `Daily ROI drop for ${user.plan} Schema`
        });

        await user.save({ session });
      }
    }

    await session.commitTransaction();
    console.log(`[TRUSTRA_NODE] Successfully credited ${investors.length} accounts.`);
  } catch (err) {
    await session.abortTransaction();
    console.error(`[TRUSTRA_ERROR] ROI sync failed:`, err.message);
  } finally {
    session.endSession();
  }
};

// Schedule: '0 0 * * *' (Runs once a day at midnight)
// For testing every minute, use: '* * * * *'
cron.schedule('0 0 * * *', distributeDailyROI);

export default distributeDailyROI;

