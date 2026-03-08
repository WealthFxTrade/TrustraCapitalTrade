import cron from 'node-cron';
import User from '../models/User.js';

/**
 * RIO v8.6 PORTFOLIO RATES (Zurich 2026 Standards)
 * Daily multipliers for yield calculation.
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
 * The core logic for calculating and injecting daily ROI.
 * Can be triggered by CRON or manually via an Admin Dashboard.
 */
export const runYieldDistribution = async (io) => {
  console.log('--- [RIO ENGINE] INITIATING DISTRIBUTION SEQUENCE ---');

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    // 1. Target identification: Active users with a plan who haven't been paid today
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
      // 2. Rate Selection Logic
      // We use a fallback to ensure even custom plans get a baseline 0.1%
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001;

      // 3. Calculation Logic
      // Yield is calculated based on the primary 'EUR' balance
      const principal = user.balances.get('EUR') || 0;
      const accruedAmount = principal * rate;

      if (accruedAmount <= 0) {
        console.log(`[RIO ENGINE] Skipping ${user.username}: Insufficient Principal.`);
        continue;
      }

      // 4. Ledger and Balance Mutation
      // Update the Map-based ROI balance
      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + accruedAmount);

      // Increment Global Profit Accumulator
      user.totalProfit = (user.totalProfit || 0) + accruedAmount;
      
      // Update Total Balance (Principal + New Profit)
      user.totalBalance = principal + user.balances.get('ROI');

      // 5. Immutable Ledger Entry
      user.ledger.push({
        amount: accruedAmount,
        currency: 'EUR',
        type: 'yield',
        status: 'completed',
        description: `Daily Rio Accrual: ${user.activePlan} Node`,
        createdAt: new Date()
      });

      // 6. Persistence Handshake
      user.lastRoiAt = new Date();

      // IMPORTANT: Mongoose doesn't track changes inside Maps or Arrays automatically.
      // We must explicitly flag them as modified.
      user.markModified('balances');
      user.markModified('ledger');

      await user.save();
      updatedCount++;

      // 7. Real-Time Synchronization (Socket.io)
      // This pushes the new balance to the user's dashboard instantly without a refresh.
      if (io) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(user.balances),
          totalProfit: user.totalProfit,
          totalBalance: user.totalBalance,
          message: `Daily yield of €${accruedAmount.toFixed(2)} credited.`
        });
      }
    }

    console.log(`--- [RIO ENGINE] SUCCESS: ${updatedCount} NODES SYNCHRONIZED ---`);
    return updatedCount;

  } catch (error) {
    console.error('--- [CRITICAL] ENGINE STALL ---', error);
    throw error;
  }
};

/**
 * ⏰ initRioEngine
 * Scheduler initialization.
 */
export const initRioEngine = (io) => {
  // Midnight UTC Distribution
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
