import cron from 'node-cron';
import User from '../models/User.js';

// Synchronized Rio v8.6 Daily Rates
const RIO_DAILY_RATES = {
  'Rio Starter': 0.0025,  // 0.25% daily
  'Rio Basic': 0.0035,    // 0.35% daily
  'Rio Standard': 0.0048, // 0.48% daily
  'Rio Advanced': 0.0062, // 0.62% daily
  'Rio Elite': 0.0085     // 0.85% daily
};

/**
 * 🚀 THE ENGINE: runYieldDistribution
 * Core logic to calculate and inject daily ROI.
 */
export const runYieldDistribution = async () => {
  console.log('--- [RIO ENGINE] INITIATING DISTRIBUTION SEQUENCE ---');
  
  // Define the boundary for "Today" (UTC Midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    // Find users who:
    // 1. Are active and not banned
    // 2. Have an investment plan
    // 3. HAVEN'T been paid yet today (lastRoiAt < midnight OR null)
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
      const accruedAmount = user.totalBalance * rate;

      if (accruedAmount <= 0) continue;

      // 1. Update Map-based ROI balance
      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + accruedAmount);

      // 2. Update Global Accumulators
      user.totalProfit += accruedAmount;

      // 3. Document the injection in the Ledger
      user.ledger.push({
        amount: accruedAmount,
        currency: 'EUR',
        type: 'yield',
        status: 'completed',
        description: `Daily Rio Accrual: ${user.activePlan}`,
        createdAt: new Date()
      });

      // 4. Update the Safety Timestamp
      user.lastRoiAt = new Date();

      // 5. Inform Mongoose of changes to complex types
      user.markModified('balances');
      user.markModified('ledger');

      await user.save();
      updatedCount++;
    }

    console.log(`--- [RIO ENGINE] SUCCESS: ${updatedCount} NODES SYNCHRONIZED ---`);
    return updatedCount;

  } catch (error) {
    console.error('--- [CRITICAL] ENGINE STALL ---', error);
    throw error;
  }
};

/**
 * ⏰ THE CLOCK: initializeProfitDistributor
 * Schedules the engine to run every midnight.
 */
export const initializeProfitDistributor = () => {
  // Cron: 0 0 * * * (Every day at 00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      await runYieldDistribution();
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  });
};
