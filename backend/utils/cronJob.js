import cron from 'node-cron';
import User from '../models/User.js';

/**
 * 🕒 GLOBAL ROI DISTRIBUTION
 * Scheduled to run every day at Midnight (00:00)
 */
const initCronJobs = (io) => {
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [SYSTEM] Initializing Global ROI Distribution...');

    try {
      // 1. Find all eligible users
      const activeUsers = await User.find({ 
        isPlanActive: true, 
        investedAmount: { $gt: 0 },
        banned: false 
      });

      if (activeUsers.length === 0) {
        console.log('ℹ️ [SYSTEM] No active investments found to process.');
        return;
      }

      for (let user of activeUsers) {
        try {
          // 2. Calculate Profit (Using the rate from user doc)
          // Default to 1% if dailyRoiRate is missing
          const rate = user.dailyRoiRate || 0.01; 
          const dailyProfit = Number((user.investedAmount * rate).toFixed(2));

          if (dailyProfit <= 0) continue;

          // 3. Update Balance (EUR_PROFIT Map)
          const currentProfit = user.balances.get('EUR_PROFIT') || 0;
          user.balances.set('EUR_PROFIT', Number((currentProfit + dailyProfit).toFixed(2)));

          // 4. Update Plan Progress
          user.planDaysServed = (user.planDaysServed || 0) + 1;
          user.lastProfitDate = new Date();

          // 5. Check for Plan Expiry
          if (user.planDaysServed >= (user.planDuration || 30)) {
            user.isPlanActive = false;
            // Optionally: Move investedAmount back to EUR balance here
            console.log(`🏁 [PLAN_EXPIRED] ${user.email} completed ${user.planDaysServed} days.`);
          }

          // 6. Record in Ledger for Transparency
          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit',
            status: 'completed',
            description: `Daily ROI: +€${dailyProfit.toFixed(2)} (${user.plan} plan)`,
            createdAt: new Date()
          });

          // 7. Save to Database (Bypassing validation for speed in cron)
          user.markModified('balances');
          user.markModified('ledger');
          await user.save({ validateBeforeSave: false });

          // 8. 🚀 REAL-TIME NOTIFICATION via Socket.io
          if (io) {
            io.to(user._id.toString()).emit('profit_update', {
              newProfit: user.balances.get('EUR_PROFIT'),
              addedAmount: dailyProfit,
              message: `Daily ROI of €${dailyProfit.toFixed(2)} secured.`
            });
          }

        } catch (userErr) {
          console.error(`⚠️ [USER_SYNC_ERROR] ${user.email}:`, userErr.message);
        }
      }

      console.log(`✅ [CRON] Distribution complete. Updates pushed to ${activeUsers.length} users.`);
    } catch (err) {
      console.error('❌ [CRITICAL_CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

