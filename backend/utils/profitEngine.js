import cron from 'node-cron';
import User from '../models/User.js';

// Synchronized Rio v8.6 Daily Rates
// These reflect the tiers established for the 2026 Zurich portfolio
const RIO_DAILY_RATES = {
  'Rio Starter': 0.0025,  // 0.25% daily
  'Rio Basic': 0.0035,    // 0.35% daily
  'Rio Standard': 0.0048, // 0.48% daily
  'Rio Advanced': 0.0062, // 0.62% daily
  'Rio Elite': 0.0085     // 0.85% daily
};

/**
 * 🚀 THE ENGINE: runYieldDistribution
 * Core logic to calculate and inject daily ROI based on active investment nodes.
 */
export const runYieldDistribution = async () => {
  console.log('--- [RIO ENGINE] INITIATING DISTRIBUTION SEQUENCE ---');

  // Define the boundary for "Today" (UTC Midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    /**
     * @query NodeSelection
     * Filters for active, unbanned users with a valid plan who haven't 
     * received an accrual yet in the current 24-hour cycle.
     */
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
      // Retrieve rate based on plan; fallback to 0.1% if plan data is corrupted
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001;
      
      // Calculate profit based on the Principal EUR balance
      const principal = user.balances.get('EUR') || 0;
      const accruedAmount = principal * rate;

      if (accruedAmount <= 0) continue;

      // 1. Update Map-based ROI balance (Profit Wallet)
      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + accruedAmount);

      // 2. Update Global Accumulators for Dashboard visualization
      user.totalProfit = (user.totalProfit || 0) + accruedAmount;

      // 3. Document the injection in the Immutable Ledger
      user.ledger.push({
        amount: accruedAmount,
        currency: 'EUR',
        type: 'yield',
        status: 'completed',
        description: `Daily Rio Accrual: ${user.activePlan} Node`,
        createdAt: new Date()
      });

      // 4. Update the Safety Timestamp to lock this node for the rest of today
      user.lastRoiAt = new Date();

      // 5. Inform Mongoose of changes to complex Map types and Arrays
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
 * Schedules the engine to run automatically every midnight.
 */
export const initializeProfitDistributor = () => {
  // Cron: 0 0 * * * (Triggers at exactly 00:00:00 every day)
  cron.schedule('0 0 * * *', async () => {
    try {
      await runYieldDistribution();
    } catch (err) {
      console.error('[CRON ERROR] Yield Distribution Interrupted:', err);
    }
  });

  console.log('⏰ [RIO ENGINE] Scheduler Active: Distribution set for Midnight UTC.');
};
