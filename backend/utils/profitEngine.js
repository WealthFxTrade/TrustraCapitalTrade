import cron from 'node-cron';
import User from '../models/User.js';

// Synchronized Rio v8.6 Daily Rates (calculated from monthly ROI)
const RIO_DAILY_RATES = {
  'Rio Starter': 0.0025,  // 0.25% daily
  'Rio Basic': 0.0035,    // 0.35% daily
  'Rio Standard': 0.0048, // 0.48% daily
  'Rio Advanced': 0.0062, // 0.62% daily
  'Rio Elite': 0.0085     // 0.85% daily
};

export const initializeProfitDistributor = () => {
  // Runs every 24 hours at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('--- [RIO ENGINE] STARTING DAILY DISTRIBUTION ---');

    try {
      const activeUsers = await User.find({
        isActive: true,
        isBanned: false,
        activePlan: { $ne: 'none' } // Only users with an actual node
      });

      for (let user of activeUsers) {
        // Calculate rate based on their specific node
        const rate = RIO_DAILY_RATES[user.activePlan] || 0.001; // Default 0.1% if unknown
        const accruedAmount = user.totalBalance * rate;

        if (accruedAmount <= 0) continue;

        // 1. Update Map-based ROI balance
        const currentRoi = user.balances.get('ROI') || 0;
        user.balances.set('ROI', currentRoi + accruedAmount);
        
        // 2. Update Global Accumulators
        user.totalProfit += accruedAmount;

        // 3. Document the injection in the Ledger
        user.ledger.push({
          amount: accruedAmount,
          currency: 'EUR',
          type: 'yield',
          status: 'completed',
          description: `Rio Protocol Accrual: ${user.activePlan}`,
          createdAt: new Date()
        });

        // 4. Protection for Mongoose Map types
        user.markModified('balances');
        user.markModified('ledger');
        
        await user.save();
      }

      console.log(`--- [RIO ENGINE] SYNC COMPLETE: ${activeUsers.length} NODES UPDATED ---`);
    } catch (err) {
      console.error('--- [CRITICAL] ENGINE STALL ---', err);
    }
  });
};
