// backend/utils/rioEngine.js
import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * 📊 RIO DAILY YIELD RATES
 * Keys must match the 'activePlan' string sent from the frontend.
 * Rates are calculated as: (Monthly Target / 30 Days).
 */
const RIO_DAILY_RATES = {
  'Tier I: Entry': 0.002,          // ~6% Monthly
  'Tier II: Core': 0.0035,         // ~10.5% Monthly
  'Tier III: Prime': 0.0045,       // ~13.5% Monthly
  'Tier IV: Institutional': 0.006, // ~18% Monthly
  'Tier V: Sovereign': 0.008       // ~24% Monthly
};

/**
 * 🪐 CORE DISTRIBUTION LOGIC
 * Iterates through all active investors and credits daily yield.
 */
export const runYieldDistribution = async (io) => {
  const sessionDate = new Date().toISOString().split('T')[0];

  console.log(`🌘 [RIO ENGINE] STARTING DISTRIBUTION FOR: ${sessionDate}`);

  try {
    // 1. Fetch only active, unbanned users with a valid plan
    const users = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'None' }
    });

    if (users.length === 0) {
      console.log('🌘 [RIO ENGINE] No active nodes found for distribution.');
      return;
    }

    for (const user of users) {
      // 2. Principal check (Invested amount)
      const principal = user.balances.get('INVESTED') || 0;
      if (principal <= 0) continue;

      // 3. Idempotency Check: Prevent double payout for the same day
      const alreadyPaid = await Transaction.exists({
        user: user._id,
        type: 'yield',
        'metadata.sessionDate': sessionDate
      });

      if (alreadyPaid) {
        console.log(`⏩ [RIO ENGINE] Skipping ${user.email} - Already paid today.`);
        continue;
      }

      // 4. Calculate Yield based on Tier
      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001; // Default to 0.1% if plan unknown
      const yieldAmount = principal * rate;
      const rounded = Number(yieldAmount.toFixed(2));

      if (rounded <= 0) continue;

      // 5. Atomic Balance Update
      // Credits Available Balance (EUR) and updates Total Profit tracker
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            'balances.EUR': rounded,
            'balances.TOTAL_PROFIT': rounded
          }
        },
        { new: true }
      );

      // 6. Record the Ledger Entry
      await Transaction.create({
        user: user._id,
        type: 'yield',
        amount: rounded,
        currency: 'EUR',
        status: 'completed',
        description: `Daily Yield Payout: ${user.activePlan}`,
        metadata: {
          sessionDate,
          rate,
          principal,
          plan: user.activePlan
        }
      });

      // 7. Push Real-time Update via Socket.io
      if (io && updatedUser) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: Object.fromEntries(updatedUser.balances),
          message: `💰 Daily Yield Credited: +€${rounded.toLocaleString('de-DE')}`
        });
      }
    }

    console.log(`✅ [RIO ENGINE] DISTRIBUTION COMPLETE FOR ${sessionDate}`);
  } catch (err) {
    console.error('❌ [RIO ENGINE FATAL ERROR]:', err);
  }
};

/**
 * ⚙️ ENGINE INITIALIZATION
 * Schedules the distribution at 00:00 (Midnight) Server Time.
 */
export const initRioEngine = (io) => {
  console.log('⚙️ RIO ENGINE INITIALIZED (Daily @ 00:00)');

  // Standard Daily Cron
  cron.schedule('0 0 * * *', () => {
    runYieldDistribution(io);
  });
};

