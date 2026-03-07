import cron from 'node-cron';
import User from '../models/User.js';

/**
 * RIO v8.6 PORTFOLIO RATES (Zurich 2026 Standards)
 */
const RIO_DAILY_RATES = {
  'Rio Starter': 0.0025,  // 0.25% daily
  'Rio Basic': 0.0035,    // 0.35% daily
  'Rio Standard': 0.0048, // 0.48% daily
  'Rio Advanced': 0.0062, // 0.62% daily
  'Rio Elite': 0.0085     // 0.85% daily
};

/**
 * 🚀 runYieldDistribution
 * Calculates and injects daily ROI into the Map-based balances.
 */
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
      console.log('--- [RIO ENGINE] ZERO NODES PENDING FOR TODAY ---');
      return 0;
    }

    let updatedCount = 0;

    for (let user of activeUsers) {
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001;
      const principal = user.balances.get('EUR') || 0;
      const accruedAmount = principal * rate;

      if (accruedAmount <= 0) continue;

      // 1. Update Map-based ROI balance
      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + accruedAmount);

      // 2. Update Global Accumulators
      user.totalProfit = (user.totalProfit || 0) + accruedAmount;

      // 3. Document in the Immutable Ledger
      user.ledger.push({
        amount: accruedAmount,
        currency: 'EUR',
        type: 'yield',
        status: 'completed',
        description: `Daily Rio Accrual: ${user.activePlan} Node`,
        createdAt: new Date()
      });

      user.lastRoiAt = new Date();

      // IMPORTANT: Tell Mongoose the Map and Array have changed
      user.markModified('balances');
      user.markModified('ledger');

      await user.save();
      updatedCount++;

      // 4. EMIT REAL-TIME UPDATE (If Socket.io is provided)
      if (io) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(user.balances),
          totalProfit: user.totalProfit
        });
      }
    }

    console.log(`--- [RIO ENGINE] SUCCESS: ${updatedCount} NODES SYNCHRONIZED ---`);
    return updatedCount;

  } catch (error) {
    console.error('--- [CRITICAL] ENGINE STALL ---', error);
  }
};

/**
 * ⏰ initRioEngine
 * Primary entry point used by server.js
 */
export const initRioEngine = (io) => {
  // Cron: 0 0 * * * (Every Midnight UTC)
  cron.schedule('0 0 * * *', async () => {
    try {
      await runYieldDistribution(io);
    } catch (err) {
      console.error('[CRON ERROR] Yield Distribution Interrupted:', err);
    }
  });

  // Optional: Trigger a dry-run check on startup for missed distributions
  console.log('⏰ [RIO ENGINE] Scheduler Active: Distribution set for Midnight UTC.');
};
