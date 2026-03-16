import cron from 'node-cron';
import User from '../models/User.js';

const RIO_DAILY_RATES = {
  'Rio Starter': 0.0025,
  'Rio Basic': 0.0035,
  'Rio Standard': 0.0048,
  'Rio Advanced': 0.0062,
  'Rio Elite': 0.0085 
};

export const runYieldDistribution = async (io) => {
  console.log('--- [RIO ENGINE] INITIATING DISTRIBUTION SEQUENCE ---');
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const activeUsers = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'none' },
      $or: [
        { lastRoiAt: { $lt: startOfToday } },
        { lastRoiAt: null }
      ]
    });

    if (activeUsers.length === 0) {
      console.log('--- [RIO ENGINE] ZERO NODES PENDING ---');
      return 0;
    }

    let updatedCount = 0;

    for (let user of activeUsers) {
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001;

      // ⚡ CALCULATION BASED ON 'INVESTED' BALANCE
      const principal = user.balances.get('INVESTED') || 0;
      const accruedAmount = principal * rate;

      if (accruedAmount <= 0) continue;

      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + accruedAmount);

      user.totalProfit = (user.totalProfit || 0) + accruedAmount;
      
      // Total Equity = Liquid EUR + Unclaimed ROI + Invested Capital
      user.totalBalance = (user.balances.get('EUR') || 0) + 
                          user.balances.get('ROI') + 
                          principal;

      user.ledger.push({
        amount: accruedAmount,
        currency: 'EUR',
        type: 'yield',
        status: 'completed',
        description: `Daily Rio Accrual: ${user.activePlan} Node`,
        createdAt: new Date()
      });

      user.lastRoiAt = new Date();
      user.markModified('balances');
      user.markModified('ledger');

      await user.save();
      updatedCount++;

      if (io) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(user.balances),
          totalProfit: user.totalProfit,
          totalBalance: user.totalBalance,
          message: `Daily yield of €${accruedAmount.toFixed(2)} credited.`
        });
      }
    }

    console.log(`--- [RIO ENGINE] SUCCESS: ${updatedCount} NODES PROCESSED ---`);
    return updatedCount;
  } catch (error) {
    console.error('--- [CRITICAL] ENGINE STALL ---', error);
    throw error;
  }
};

export const initRioEngine = (io) => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await runYieldDistribution(io);
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  });
  console.log('⏰ [RIO ENGINE] Scheduler Active: Midnight UTC Distribution.');
};

