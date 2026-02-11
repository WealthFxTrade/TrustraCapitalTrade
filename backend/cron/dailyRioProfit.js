import cron from 'node-cron';
import User from '../models/User.js';
import { PLAN_DATA } from '../config/plans.js'; // The file you just provided

cron.schedule('0 0 * * *', async () => {
  console.log('🕒 Processing Rio Profit Distribution...');
  const today = new Date().setHours(0, 0, 0, 0);

  try {
    const activeInvestors = await User.find({ isPlanActive: true, banned: false });

    for (let user of activeInvestors) {
      // 1. Double-payment protection
      const lastPaid = user.lastProfitDate ? new Date(user.lastProfitDate).setHours(0, 0, 0, 0) : null;
      if (lastPaid === today) continue;

      // 2. Fetch Plan Config from your PLAN_DATA
      const planConfig = PLAN_DATA[user.planKey];
      if (!planConfig) {
        console.error(`⚠️ No plan config for key: ${user.planKey} (User: ${user.email})`);
        continue;
      }

      // 3. Calculate Daily Profit (Invested * dailyROI)
      const profit = user.investedAmount * planConfig.dailyROI;

      if (profit > 0) {
        // Update EUR Balance
        const currentBalance = user.balances.get('EUR') || 0;
        user.balances.set('EUR', currentBalance + profit);

        // Record in Ledger
        user.ledger.push({
          amount: profit,
          currency: 'EUR',
          type: 'roi_profit',
          status: 'completed',
          description: `Daily ROI: ${planConfig.name}`
        });

        // Save progress
        user.lastProfitDate = new Date();
        user.markModified('balances'); // Required for Mongoose Map
        await user.save();
      }
    }
    console.log('✅ Daily Rio Profits Distributed.');
  } catch (err) {
    console.error('❌ Cron Job Failed:', err.message);
  }
});

