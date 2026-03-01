import cron from 'node-cron';
import User from '../models/User.js';

/**
 * 🕒 GLOBAL ROI DISTRIBUTION ENGINE
 * Exported as 'startRoiEngine' to match server.js requirements
 */
export const startRoiEngine = (io) => {
  // Scheduled to run every day at Midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [SYSTEM] Initializing Global ROI Distribution Protocol...');                                                                     
    
    try {
      // 1. Find all eligible users
      const activeUsers = await User.find({
        isPlanActive: true,
        investedAmount: { $gt: 0 },
        banned: false
      });                                                             
      
      if (activeUsers.length === 0) {
        console.log('ℹ️ [SYSTEM] No active investment nodes detected. Standby.');
        return;
      }

      for (let user of activeUsers) {
        try {
          // 2. Calculate Profit 
          const rate = user.dailyRoiRate || 0.01; // Default 1%
          const dailyProfit = Number((user.investedAmount * rate).toFixed(2));

          if (dailyProfit <= 0) continue;

          // 3. Update Balance (Using Map logic)
          const currentProfit = user.balances.get('EUR_PROFIT') || 0;
          user.balances.set('EUR_PROFIT', Number((currentProfit + dailyProfit).toFixed(2)));

          // 4. Update Node Progress
          user.planDaysServed = (user.planDaysServed || 0) + 1;
          user.lastProfitDate = new Date();

          // 5. Expiry Check
          if (user.planDaysServed >= (user.planDuration || 30)) {
            user.isPlanActive = false;
            console.log(`🏁 [EXPIRY] ${user.email} node cycle complete.`);
          }

          // 6. Ledger Update
          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit',
            status: 'completed',
            description: `Daily Yield: +€${dailyProfit.toFixed(2)}`,
            createdAt: new Date()
          });

          // 7. Atomic Save
          user.markModified('balances');
          user.markModified('ledger');
          await user.save({ validateBeforeSave: false });

          // 8. Real-time Transmission
          if (io) {
            io.to(user._id.toString()).emit('profit_update', {
              newProfit: user.balances.get('EUR_PROFIT'),
              addedAmount: dailyProfit
            });
          }                                                           
        } catch (userErr) {
          console.error(`⚠️ [SYNC_ERR] ${user.email}:`, userErr.message);
        }
      }

      console.log(`✅ [ENGINE] Yield distributed to ${activeUsers.length} nodes.`);
    } catch (err) {
      console.error('❌ [CRITICAL_ENGINE_ERROR]:', err.message);
    }
  });
};

// Also export as default just in case
export default startRoiEngine;
