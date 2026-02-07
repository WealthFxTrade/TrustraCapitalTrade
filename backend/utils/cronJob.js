import cron from 'node-cron';
// FIXED: Added .js extension for ESM compatibility in Node v25
import User from '../models/User.js'; 

// ROI Rates Table - Synchronized with Rio Series 2026
const PLAN_RATES = {
  'Rio Starter': 0.0025,   // ~7.5% Monthly (0.25% daily)
  'Rio Basic': 0.0035,     // ~10.5% Monthly
  'Rio Standard': 0.0046,  // ~14% Monthly
  'Rio Advanced': 0.006,   // ~18% Monthly
  'Rio Elite': 0.0075      // ~22.5% Monthly
};

// Schedule: Runs every day at 00:00 (Midnight)
const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toISOString()}] 🕒 Trustra Engine: Distributing Daily EUR ROI...`);

    try {
      // Find users with an active plan and a valid Rio Series name
      const activeUsers = await User.find({ 
        isPlanActive: true, 
        plan: { $in: Object.keys(PLAN_RATES) } 
      });

      for (const user of activeUsers) {
        const rate = PLAN_RATES[user.plan];
        
        // Use investedAmount field or calculate from the latest ledger entry
        const capital = user.investedAmount || 0;

        if (rate && capital > 0) {
          const dailyProfit = Number((capital * rate).toFixed(2));

          // 1. Add profit to the 'EUR' balance (Profit Wallet)
          const currentBalance = user.balances.get('EUR') || 0;
          user.balances.set('EUR', currentBalance + dailyProfit);

          // 2. Record profit in ledger using EUR currency
          user.ledger.push({
            amount: dailyProfit,
            currency: 'EUR',
            type: 'roi_profit',
            status: 'completed',
            description: `Daily ROI: ${user.plan} (${(rate * 100).toFixed(2)}%)`,
            createdAt: new Date()
          });

          // 3. Mark modified for Mongoose Map and save
          user.markModified('balances');
          user.markModified('ledger');
          await user.save();
        }
      }
      console.log(`[TRUSTRA] ROI Cycle Complete. Processed ${activeUsers.length} investors.`);
    } catch (err) {
      console.error('[TRUSTRA_CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

