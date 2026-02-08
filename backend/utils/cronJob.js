import cron from 'node-cron';
import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import { confirmDeposit } from '../services/confirmDeposit.js';

const PLAN_RATES = {
  'Rio Starter': 0.0025,
  'Rio Basic': 0.0035,
  'Rio Standard': 0.0046,
  'Rio Advanced': 0.006,
  'Rio Elite': 0.0075
};

export default function initCronJobs() {
  console.log('🕒 [Cron] Trustra Capital 2026 Engine Online');

  // BTC Deposit Watcher: Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const deposits = await Deposit.find({
        status: { $in: ['pending', 'confirming'] },
        txid: { $exists: true, $ne: null },
        locked: { $ne: true }
      });

      for (const deposit of deposits) {
        deposit.locked = true;
        await deposit.save();
        
        await confirmDeposit(deposit._id);
        
        deposit.locked = false;
        await deposit.save();
      }
    } catch (err) {
      console.error('[Cron Error] Deposit Watcher:', err.message);
    }
  });

  // Daily ROI Engine: Runs at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Calculating Daily ROI...');
    try {
      const users = await User.find({ isPlanActive: true });
      for (const user of users) {
        const rate = PLAN_RATES[user.plan];
        if (rate && user.investedAmount > 0) {
          const dailyProfit = Number((user.investedAmount * rate).toFixed(2));
          const currentEUR = user.balances.get('EUR') || 0;
          user.balances.set('EUR', currentEUR + dailyProfit);
          user.markModified('balances');
          await user.save();
        }
      }
    } catch (err) {
      console.error('[Cron Error] ROI Engine:', err.message);
    }
  });
}

