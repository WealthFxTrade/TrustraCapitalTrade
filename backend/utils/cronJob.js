import cron from 'node-cron';
import User from '../models/User.js';

const PLAN_RATES = {
  'Rio Starter': 0.003,
  'Rio Basic': 0.004,
  'Rio Standard': 0.005,
  'Rio Advanced': 0.006,
  'Rio Elite': 0.008
};

const initCronJobs = () => {
  // Runs every day at midnight (2026-02-06 00:00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      const activeUsers = await User.find({ isPlanActive: true });

      for (const user of activeUsers) {
        const rate = PLAN_RATES[user.plan];
        
        // Find the specific investment entry to calculate ROI on that amount
        const investment = user.ledger
          .filter(e => e.type === 'investment')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (rate && investment) {
          const profit = investment.amount * rate;
          const currentUsd = user.balances.get('USD') || 0;

          user.balances.set('USD', currentUsd + profit);
          user.ledger.push({
            amount: profit,
            currency: 'USD',
            type: 'roi_profit',
            status: 'completed',
            createdAt: new Date()
          });

          await user.save();
        }
      }
      console.log(`[${new Date().toISOString()}] ROI Distribution Complete.`);
    } catch (err) {
      console.error('CRON ERROR:', err.message);
    }
  });
};

export default initCronJobs;

