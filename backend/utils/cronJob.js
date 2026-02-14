import cron from 'node-cron';
import User from '../models/User.js';
import { PLAN_DATA } from '../config/plans.js'; // Use your existing plan config

const initCronJobs = () => {
  // Runs every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [CRON] Initializing daily profit distribution...');

    try {
      const activeUsers = await User.find({ isPlanActive: true, banned: false });
      
      if (activeUsers.length === 0) {
        return console.log('🕒 [CRON] No active nodes found.');
      }

      for (let user of activeUsers) {
        // Use the rate defined in your Plan Config OR the rate stored on the user
        const dailyRate = user.dailyRoiRate || (PLAN_DATA[user.plan]?.dailyROI) || 0;

        if (user.investedAmount > 0 && dailyRate > 0) {
          const dailyProfit = user.investedAmount * dailyRate;

          // 1. Get current Profit Balance (EUR_PROFIT)
          const currentProfit = user.balances.get('EUR_PROFIT') || 0;

          // 2. Update the Profit Wallet
          user.balances.set('EUR_PROFIT', currentProfit + dailyProfit);

          // 3. Add Ledger Entry
          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit',
            status: 'completed',
            description: `Daily ROI: ${user.plan} Node Sync`,
            createdAt: new Date()
          });

          // 4. Update tracking fields
          user.planDaysServed += 1;
          user.lastProfitDate = new Date();

          // 5. Auto-Expire Plan Logic
          if (user.planDaysServed >= user.planDuration) {
            user.isPlanActive = false;
            console.log(`📡 [CRON] Plan expired for ${user.email}`);
          }

          // 6. Save changes
          user.markModified('balances');
          await user.save({ validateBeforeSave: false });
        }
      }
      console.log(`✅ [CRON] Distributed profits to ${activeUsers.length} users.`);
    } catch (err) {
      console.error('❌ [CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;
