import cron from 'node-cron';
import User from '../models/User.js';

/**
 * RIO SERIES MONTHLY ROI MAPPED TO DAILY RATES (2026 EUR Standard)
 * Logic: Monthly ROI range averaged and divided by 30 days.
 */
const PLAN_RATES = {
  'Rio Starter': 0.0025,   // ~7.5% Monthly
  'Rio Basic': 0.0035,     // ~10.5% Monthly
  'Rio Standard': 0.0046,  // ~14% Monthly
  'Rio Advanced': 0.006,   // ~18% Monthly
  'Rio Elite': 0.0075      // ~22.5% Monthly
};

const initCronJobs = () => {
  // SCHEDULE: Runs every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toISOString()}] 🕒 Trustra Engine: Distributing Daily EUR ROI...`);

    try {
      // 1. Process investors with active schema
      const activeUsers = await User.find({ 
        isPlanActive: true, 
        plan: { $in: Object.keys(PLAN_RATES) } 
      });

      for (const user of activeUsers) {
        const rate = PLAN_RATES[user.plan];

        // 2. Identify the active capital amount (investedAmount)
        // We prioritize the 'investedAmount' field or the latest completed investment entry
        const capital = user.investedAmount || 
          user.ledger.filter(e => e.type === 'investment' && e.status === 'completed')
          .sort((a, b) => b.createdAt - a.createdAt)[0]?.amount;

        if (rate && capital > 0) {
          const profit = Number((capital * rate).toFixed(2));

          if (profit > 0) {
            // 3. Update the Profit Wallet (totalProfit)
            // Matches dashboard green card logic
            user.totalProfit = (user.totalProfit || 0) + profit;

            // 4. Log to ledger using EUR (Matches 2026 standard)
            user.ledger.push({
              amount: profit,
              currency: 'EUR', 
              type: 'roi_profit', 
              status: 'completed',
              description: `Daily ROI Drop: ${user.plan} (${(rate * 100).toFixed(2)}%)`,
              createdAt: new Date()
            });

            // 5. Automatic Plan Expiry Check (Optional but Recommended)
            // If plan duration is exceeded, you could set isPlanActive = false here
            
            await user.save();
          }
        }
      }
      console.log(`[TRUSTRA_NODE] ROI Cycle Complete. Processed ${activeUsers.length} investors.`);
    } catch (err) {
      console.error('[TRUSTRA_CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

