import cron from 'node-cron';
import User from '../models/User.js';

export const startRoiEngine = (io) => {
  // Midnight Cron: '0 0 * * *' 
  // TIP: Use '*/5 * * * *' (every 5 mins) during dev to verify logic
  cron.schedule('0 0 * * *', async () => {
    console.log('🕒 [SYSTEM] Initializing Global ROI Distribution...');

    try {
      // 1. Fetch only users eligible for yield
      const activeUsers = await User.find({
        isPlanActive: true,
        investedAmount: { $gt: 0 },
        banned: false
      });

      if (activeUsers.length === 0) {
        console.log('ℹ️ [ENGINE] No active investment nodes found.');
        return;
      }

      // 2. Process updates sequentially or in small batches to protect DB performance
      for (const user of activeUsers) {
        try {
          // Fallback logic for rates and amounts
          const rate = user.dailyRoiRate || 0.032; // Default to 3.2% if not set
          const dailyProfit = Number((user.investedAmount * rate).toFixed(2));

          if (dailyProfit <= 0) continue;

          // 3. Update Balances (Compatible with Mongoose Map or Object)
          const currentProfit = user.balances?.EUR_PROFIT || 0;
          const newTotal = Number((currentProfit + dailyProfit).toFixed(2));
          
          // Using dot notation for better compatibility with Mongoose objects
          user.balances.EUR_PROFIT = newTotal;
          user.planDaysServed = (user.planDaysServed || 0) + 1;
          user.lastProfitDate = new Date();

          // 4. Lifecycle Management: Deactivate plan if duration met
          if (user.planDaysServed >= (user.planDuration || 30)) {
            user.isPlanActive = false;
            console.log(`🔌 [PLAN_END] User ${user.email} completed their cycle.`);
          }

          // 5. Audit Logging (The Ledger)
          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit',
            status: 'completed',
            description: `Daily Yield: +€${dailyProfit.toFixed(2)}`,
            createdAt: new Date()
          });

          // Critical for Mixed/Map types
          user.markModified('balances');
          user.markModified('ledger');

          await user.save({ validateBeforeSave: false });

          // 6. Real-time Socket Handshake
          if (io) {
            io.to(user._id.toString()).emit('profit_update', {
              newProfit: newTotal,
              addedAmount: dailyProfit
            });
          }
        } catch (err) {
          console.error(`⚠️ [USER_ERR] ${user.email}:`, err.message);
        }
      }

      console.log(`✅ [ENGINE] Distributed yield to ${activeUsers.length} users.`);
    } catch (err) {
      console.error('❌ [CRITICAL_ENGINE_ERROR]:', err.message);
    }
  });
};

export default startRoiEngine;
