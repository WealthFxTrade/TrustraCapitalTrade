import cron from 'node-cron';
import User from '../models/User.js';

/**
 * RIO v8.6 PORTFOLIO RATES (Zurich 2026 Standards)
 * Match these exactly to the "plan" strings in your User Model.
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
    // Find active users who haven't received ROI yet today
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
      // Logic: Exact match first, then case-insensitive fallback, then minimum rate
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001; 
      
      const principal = user.balances.get('EUR') || 0;
      const accruedAmount = principal * rate;

      if (accruedAmount <= 0) {
        console.log(`[RIO ENGINE] Skipping ${user.username}: Zero Principal.`);
        continue;
      }

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

      // 4. Update the "Last Paid" timestamp to prevent double-dipping
      user.lastRoiAt = new Date();

      // IMPORTANT: Tell Mongoose the Map and Array have changed
      user.markModified('balances');
      user.markModified('ledger');

      await user.save();
      updatedCount++;

      // 5. EMIT REAL-TIME UPDATE (If Socket.io is provided)
      if (io) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(user.balances),
          totalProfit: user.totalProfit,
          message: `Daily yield of €${accruedAmount.toFixed(2)} credited.`
        });
      }
    }

    console.log(`--- [RIO ENGINE] SUCCESS: ${updatedCount} NODES SYNCHRONIZED ---`);
    return updatedCount;

  } catch (error) {
    console.error('--- [CRITICAL] ENGINE STALL ---', error);
    throw error; // Re-throw so the controller can catch it
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
      console.log('--- [CRON] AUTOMATED MIDNIGHT DISTRIBUTION STARTED ---');
      await runYieldDistribution(io);
    } catch (err) {
      console.error('[CRON ERROR] Yield Distribution Interrupted:', err);
    }
  });

  console.log('⏰ [RIO ENGINE] Scheduler Active: Distribution set for Midnight UTC.');
};
