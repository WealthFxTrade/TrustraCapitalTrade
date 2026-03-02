import cron from 'node-cron';
import User from '../models/User.js';

export const startRoiEngine = (io) => {
  // Midnight Cron
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [SYSTEM] Initializing Global ROI Distribution...');

    try {
      const activeUsers = await User.find({
        isPlanActive: true,
        investedAmount: { $gt: 0 },
        banned: false
      });

      if (activeUsers.length === 0) return;

      // Use Promise.all with a limit or a controlled loop to prevent thread blocking
      const updates = activeUsers.map(async (user) => {
        try {
          const rate = user.dailyRoiRate || 0.01;
          const dailyProfit = Number((user.investedAmount * rate).toFixed(2));

          if (dailyProfit <= 0) return;

          const currentProfit = user.balances.get('EUR_PROFIT') || 0;
          user.balances.set('EUR_PROFIT', Number((currentProfit + dailyProfit).toFixed(2)));
          user.planDaysServed = (user.planDaysServed || 0) + 1;
          user.lastProfitDate = new Date();

          if (user.planDaysServed >= (user.planDuration || 30)) {
            user.isPlanActive = false;
          }

          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit',
            status: 'completed',
            description: `Daily Yield: +€${dailyProfit.toFixed(2)}`,
            createdAt: new Date()
          });

          user.markModified('balances');
          user.markModified('ledger');
          
          await user.save({ validateBeforeSave: false });

          if (io) {
            io.to(user._id.toString()).emit('profit_update', {
              newProfit: user.balances.get('EUR_PROFIT'),
              addedAmount: dailyProfit
            });
          }
        } catch (err) {
          console.error(`⚠️ [USER_ERR] ${user.email}:`, err.message);
        }
      });

      await Promise.all(updates);
      console.log(`✅ [ENGINE] Distributed yield to ${activeUsers.length} users.`);
    } catch (err) {
      console.error('❌ [CRITICAL_ENGINE_ERROR]:', err.message);
    }
  });
};

export default startRoiEngine;

