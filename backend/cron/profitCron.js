// backend/cron/profitCron.js
import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

cron.schedule('0 1 * * *', async () => { // 1:00 AM UTC
  console.log('Running daily profit job...');

  try {
    const users = await User.find({ plan: { $ne: 'None' }, balance: { $gt: 0 } });

    for (const user of users) {
      const dailyRate = user.dailyRate || 0;
      if (dailyRate <= 0) continue;

      const profit = user.balance * dailyRate;

      user.balance += profit;
      user.lastProfitUpdate = new Date();

      await user.save();

      await Transaction.create({
        user: user._id,
        type: 'profit',
        amount: profit,
        signedAmount: profit,
        status: 'completed',
        description: `Daily profit (${(dailyRate * 100).toFixed(2)}%)`,
      });
    }

    console.log(`Profit added to ${users.length} users`);
  } catch (err) {
    console.error('Profit cron failed:', err);
  }
}, { timezone: 'UTC' });
