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
  console.log('🕒 Initializing Trustra Capital Cron Jobs');

  // BTC Deposit Watcher (every 1 minute)
  cron.schedule('* * * * *', async () => {
    try {
      const deposits = await Deposit.find({
        status: { $in: ['pending', 'confirming'] },
        txid: { $exists: true, $ne: null },
        locked: { $ne: true }
      });

      if (deposits.length === 0) return;

      for (const deposit of deposits) {
        try {
          deposit.locked = true;
          await deposit.save();

          await confirmDeposit(deposit._id);

          deposit.locked = false;
          await deposit.save();
        } catch (err) {
          deposit.locked = false;
          await deposit.save();
        }
      }
    } catch (err) {
      console.error('[Deposit Watcher CRON ERROR]', err.message);
    }
  }, { scheduled: true, timezone: 'Europe/Berlin' });

  // Daily ROI Engine (every day at 00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      const activeUsers = await User.find({ isPlanActive: true });
      for (const user of activeUsers) {
        const rate = PLAN_RATES[user.plan];
        if (rate && user.investedAmount > 0) {
          const dailyProfit = Number((user.investedAmount * rate).toFixed(2));
          const currentEUR = user.balances.get('EUR') || 0;
          user.balances.set('EUR', currentEUR + dailyProfit);
          user.markModified('balances');
          await user.save();
        }
      }
      console.log('✅ Daily ROI distributed.');
    } catch (err) {
      console.error('ROI Engine Error:', err.message);
    }
  }, { scheduled: true, timezone: 'Europe/Berlin' });
}

