import cron from 'node-cron';
import User from '../models/User.js';

/**
 * RIO SERIES MONTHLY ROI MAPPED TO DAILY RATES
 * Based on your branding: 
 * Starter (avg 7.5% mo -> ~0.25% daily)
 * Elite (avg 22.5% mo -> ~0.75% daily)
 */
const PLAN_RATES = {
  'Rio Starter': 0.0025,   // ~7.5% Monthly
  'Rio Basic': 0.0035,     // ~10.5% Monthly
  'Rio Standard': 0.0046,  // ~14% Monthly
  'Rio Advanced': 0.006,   // ~18% Monthly
  'Rio Elite': 0.0075      // ~22.5% Monthly
};

const initCronJobs = () => {
  // SCHEDULE: Runs every day at 00:00 (Midnight UTC)
  cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toISOString()}] 🕒 Trustra Engine: Distributing Daily ROI...`);
    
    try {
      // 1. Only process investors with an active schema
      const activeUsers = await User.find({ isPlanActive: true, plan: { $in: Object.keys(PLAN_RATES) } });

      for (const user of activeUsers) {
        const rate = PLAN_RATES[user.plan];

        // 2. Find the investment amount from the ledger
        // We look for 'investment' or 'deposit' type entries that are 'completed'
        const investmentEntry = user.ledger
          .filter(e => (e.type === 'investment' || e.type === 'deposit') && e.status === 'completed')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (rate && investmentEntry) {
          const investedPrincipal = investmentEntry.amount;
          const profit = Number((investedPrincipal * rate).toFixed(2));

          if (profit > 0) {
            // 3. Update the Profit Wallet (totalProfit)
            // This ensures it appears in the green card on the dashboard
            user.totalProfit = (user.totalProfit || 0) + profit;

            // 4. Log the profit drop to the ledger
            user.ledger.push({
              amount: profit,
              currency: 'USD',
              type: 'roi_profit', // Dashboard logic uses this to calculate "Total Profit"
              status: 'completed',
              description: `Daily ROI: ${user.plan} (${(rate * 100).toFixed(2)}%)`,
              createdAt: new Date()
            });

            // Save the user document
            await user.save();
          }
        }
      }
      console.log(`[TRUSTRA_NODE] ROI Cycle Complete. Processed ${activeUsers.length} active investors.`);
    } catch (err) {
      console.error('[TRUSTRA_CRON_ERROR]:', err.message);
    }
  });
};

export default initCronJobs;

