import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const RIO_DAILY_RATES = {
  'Rio Starter': 0.0025,
  'Rio Basic': 0.0035,
  'Rio Standard': 0.0048,
  'Rio Advanced': 0.0062,
  'Rio Elite': 0.0085
};

export const runYieldDistribution = async (io) => {
  console.log('--- [RIO ENGINE] INITIATING DISTRIBUTION ---');
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const activeUsers = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'none' },
      $or: [{ lastRoiAt: { $lt: startOfToday } }, { lastRoiAt: null }]
    });

    if (activeUsers.length === 0) return 0;

    let updatedCount = 0;

    for (let user of activeUsers) {
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001;
      const principal = user.balances.get('INVESTED') || 0;
      const accruedAmount = Number((principal * rate).toFixed(2));

      if (accruedAmount <= 0) continue;

      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + accruedAmount);
      user.totalProfit = (user.totalProfit || 0) + accruedAmount;
      user.lastRoiAt = new Date();

      await Transaction.create({
        user: user._id,
        type: 'profit',
        amount: accruedAmount,
        signedAmount: accruedAmount,
        currency: 'EUR',
        status: 'completed',
        description: `Daily Rio Accrual: ${user.activePlan}`,
        method: 'internal'
      });

      user.markModified('balances');
      await user.save();
      updatedCount++;

      if (io) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(user.balances),
          totalProfit: user.totalProfit,
          message: `Daily yield of €${accruedAmount.toFixed(2)} credited.`
        });
      }
    }
    return updatedCount;
  } catch (error) {
    console.error('--- [ENGINE STALL] ---', error);
    throw error;
  }
};

export const initRioEngine = (io) => {
  cron.schedule('0 0 * * *', () => runYieldDistribution(io));
  console.log('⏰ [RIO ENGINE] Midnight UTC Distribution Active.');
};

