// backend/utils/rioEngine.js
import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * 📊 ROI DAILY YIELD RATES
 * Keys match the 'activePlan' string criteria managed on models/User.js.
 * Rates map to: (Monthly Target / 30 Days).
 */
const ROI_DAILY_RATES = {
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

  console.log(`🌘 [ROI ENGINE] STARTING DISTRIBUTION FOR: ${sessionDate}`);

  try {
    // 1. Fetch only active, unbanned users with a valid plan
    const users = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'None' }
    });

    if (users.length === 0) {
      console.log('🌘 [ROI ENGINE] No active nodes found for distribution.');
      return;
    }

    for (const user of users) {
      try {
        // 2. PRODUCTION FIX: Corrected property access syntax from Map .get() to standard nested keys
        const principal = user.balances?.INVESTED || 0;
        if (principal <= 0) continue;

        // 3. Idempotency Check: Prevent double payout for the same day
        const alreadyPaid = await Transaction.exists({
          user: user._id,
          type: 'yield',
          'metadata.sessionDate': sessionDate
        });

        if (alreadyPaid) {
          console.log(`⏩ [ROI ENGINE] Skipping ${user.email} - Already paid today.`);
          continue;
        }

        // 4. Calculate Yield based on Tier
        const rate = ROI_DAILY_RATES[user.activePlan] || 0.001; // Default to 0.1% if plan unknown
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

        if (!updatedUser) {
          console.error(`❌ [ROI ENGINE] Failed to update user node state: ${user._id}`);
          continue;
        }

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
        if (io) {
          // PRODUCTION FIX: Removed broken Object.fromEntries mapping call.
          // Directly mirrors the payload serialization engine used across Dashboard.jsx
          io.to(user._id.toString()).emit('balanceUpdate', {
            balances: {
              EUR: updatedUser.balances.EUR,
              BTC: updatedUser.balances.BTC,
              ETH: updatedUser.balances.ETH,
              TOTAL_PROFIT: updatedUser.balances.TOTAL_PROFIT,
              INVESTED: updatedUser.balances.INVESTED
            },
            message: `💰 Daily Yield Credited: +€${rounded.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
          });
        }
        
      } catch (userError) {
        // PRODUCTION HARDENING: Isolated internal loop catch prevents 
        // a single corrupt user record from crashing the entire batch process.
        console.error(`❌ [ROI ENGINE ERROR] Processing skipped for user node ${user._id}:`, userError);
      }
    }

    console.log(`✅ [ROI ENGINE] DISTRIBUTION COMPLETE FOR ${sessionDate}`);
  } catch (err) {
    console.error('❌ [ROI ENGINE FATAL BATCH SYSTEM EXCEPTION]:', err);
  }
};

/**
 * ⚙️ ENGINE INITIALIZATION
 * Schedules the distribution at 00:00 (Midnight) Server Time.
 */
export const initRioEngine = (io) => {
  console.log('⚙️ ROI ENGINE INITIALIZED (Daily @ 00:00)');

  // Standard Daily Cron Schedule
  cron.schedule('0 0 * * *', () => {
    runYieldDistribution(io);
  });
};

