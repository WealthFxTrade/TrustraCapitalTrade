import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * ✅ MATCHES LANDING PAGE (CLASS I – V)
 */
const RIO_DAILY_RATES = {
  'Class I: Entry': 0.002,        // 6–9% monthly
  'Class II: Core': 0.0035,       // 9–12%
  'Class III: Prime': 0.0045,     // 12–16%
  'Class IV: Institutional': 0.006, // 16–20%
  'Class V: Sovereign': 0.008     // 20–25%
};

export const runYieldDistribution = async (io) => {
  const sessionDate = new Date().toISOString().split('T')[0];

  console.log(`🌘 RIO ENGINE RUN: ${sessionDate}`);

  try {
    const users = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'None' }
    });

    for (const user of users) {
      const principal = user.balances.get('INVESTED') || 0;
      if (principal <= 0) continue;

      // Prevent double payout
      const alreadyPaid = await Transaction.exists({
        user: user._id,
        type: 'yield',
        'metadata.sessionDate': sessionDate
      });

      if (alreadyPaid) continue;

      const rate = RIO_DAILY_RATES[user.activePlan] || 0.001;
      const yieldAmount = principal * rate;

      if (yieldAmount <= 0) continue;

      const rounded = Number(yieldAmount.toFixed(2));

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

      await Transaction.create({
        user: user._id,
        type: 'yield',
        amount: rounded,
        currency: 'EUR',
        status: 'completed',
        metadata: {
          sessionDate,
          rate,
          principal
        }
      });

      // 🔥 REALTIME SYNC
      io.to(user._id.toString()).emit('balanceUpdate', {
        balances: Object.fromEntries(updatedUser.balances),
        message: `+€${rounded} daily yield`
      });
    }

    console.log('✅ RIO ENGINE COMPLETE');
  } catch (err) {
    console.error('❌ RIO ENGINE ERROR:', err);
  }
};

export const initRioEngine = (io) => {
  console.log('⚙️ RIO ENGINE INITIALIZED');

  cron.schedule('0 0 * * *', () => runYieldDistribution(io));
};
