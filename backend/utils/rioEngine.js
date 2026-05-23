// backend/utils/rioEngine.js
import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * 📊 ROI RATES (Annual %)
 * These are the official target annual rates per tier.
 */
const ROI_ANNUAL_RATES = {
  'Tier I: Entry': 6,
  'Tier II: Core': 10.5,
  'Tier III: Prime': 13.5,
  'Tier IV: Institutional': 18,
  'Tier V: Sovereign': 24,
};

/**
 * Calculate projected profit for frontend & admin use
 */
export const calculateProfit = ({
  amount = 0,
  plan = 'Tier III: Prime',
  durationMonths = 12,
  compounding = 'daily'   // daily, monthly, yearly
}) => {
  if (amount <= 0) {
    throw new Error('Investment amount must be greater than zero');
  }

  const annualRate = ROI_ANNUAL_RATES[plan] || 13.5;
  const rate = annualRate / 100;

  let finalAmount = amount;
  let totalProfit = 0;
  let monthlyProfit = 0;

  if (compounding === 'daily') {
    const dailyRate = rate / 365;
    finalAmount = amount * Math.pow(1 + dailyRate, durationMonths * 30.4167); // avg days in month
  } 
  else if (compounding === 'monthly') {
    const monthlyRate = rate / 12;
    finalAmount = amount * Math.pow(1 + monthlyRate, durationMonths);
  } 
  else {
    // yearly
    finalAmount = amount * Math.pow(1 + rate, durationMonths / 12);
  }

  totalProfit = finalAmount - amount;
  monthlyProfit = totalProfit / durationMonths;

  return {
    initialInvestment: Number(amount.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    monthlyProfit: Number(monthlyProfit.toFixed(2)),
    annualRate,
    plan,
    durationMonths,
    effectiveAPY: annualRate,
    compounding
  };
};

/**
 * 🪐 CORE DAILY YIELD DISTRIBUTION
 */
export const runYieldDistribution = async (io) => {
  const sessionDate = new Date().toISOString().split('T')[0];

  console.log(`🌘 [ROI ENGINE] STARTING DISTRIBUTION FOR: ${sessionDate}`);

  try {
    const users = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'None' }
    });

    if (users.length === 0) {
      console.log('🌘 [ROI ENGINE] No active investors found.');
      return;
    }

    let processed = 0;

    for (const user of users) {
      try {
        const principal = user.balances?.INVESTED || 0;
        if (principal <= 100) continue; // Skip dust

        // Idempotency check
        const alreadyPaid = await Transaction.exists({
          user: user._id,
          type: 'yield',
          'metadata.sessionDate': sessionDate
        });

        if (alreadyPaid) continue;

        const annualRate = ROI_ANNUAL_RATES[user.activePlan] || 13.5;
        const dailyRate = annualRate / 365 / 100;
        const yieldAmount = Number((principal * dailyRate).toFixed(2));

        if (yieldAmount <= 0) continue;

        // Atomic update
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            $inc: {
              'balances.EUR': yieldAmount,
              'balances.TOTAL_PROFIT': yieldAmount,
            }
          },
          { new: true }
        );

        if (!updatedUser) continue;

        // Record transaction
        await Transaction.create({
          user: user._id,
          type: 'yield',
          amount: yieldAmount,
          currency: 'EUR',
          status: 'completed',
          description: `Daily Yield • ${user.activePlan}`,
          metadata: {
            sessionDate,
            rate: dailyRate,
            principal,
            plan: user.activePlan,
            annualRate
          }
        });

        // Real-time update
        if (io) {
          io.to(user._id.toString()).emit('balanceUpdate', {
            balances: {
              EUR: updatedUser.balances.EUR,
              TOTAL_PROFIT: updatedUser.balances.TOTAL_PROFIT,
              INVESTED: updatedUser.balances.INVESTED,
            },
            message: `💰 Daily Yield Credited: +€${yieldAmount}`
          });
        }

        processed++;
      } catch (userError) {
        console.error(`❌ [ROI ENGINE] User ${user._id} failed:`, userError.message);
      }
    }

    console.log(`✅ [ROI ENGINE] DISTRIBUTION COMPLETE → ${processed} users processed`);
  } catch (err) {
    console.error('❌ [ROI ENGINE FATAL]:', err);
  }
};

/**
 * Initialize Daily Cron Job
 */
export const initRioEngine = (io) => {
  console.log('⚙️ ROI Engine Initialized (Daily @ 00:00 UTC)');

  cron.schedule('0 0 * * *', () => {
    runYieldDistribution(io);
  }, {
    timezone: "UTC"
  });
};
