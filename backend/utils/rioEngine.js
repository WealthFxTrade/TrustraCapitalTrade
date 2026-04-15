// utils/rioEngine.js
import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const RIO_DAILY_RATES = {
  'Tier I: Entry': 0.00020,
  'Tier II: Core': 0.00028,
  'Tier III: Prime': 0.00038,
  'Tier IV: Institutional': 0.00049,
  'Tier V: Sovereign': 0.00061,
  'Sovereign': 0.00061,
  'Rio Elite': 0.00061,
};

export const runYieldDistribution = async (io) => {
  const sessionDate = new Date().toISOString().split('T')[0];
  console.log(`🌘 [RIO ENGINE] EXECUTING SETTLEMENT: ${sessionDate}`);

  try {
    const activeNodes = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'None' },
      'balances.INVESTED': { $gt: 0 }   // only nodes with principal
    }).select('_id email activePlan balances');

    console.log(`📡 Processing ${activeNodes.length} Active Nodes...`);

    for (const node of activeNodes) {
      try {
        // Strong daily idempotency
        const alreadyProcessed = await Transaction.findOne({
          user: node._id,
          type: 'yield',
          createdAt: {
            $gte: new Date(sessionDate),
            $lt: new Date(new Date(sessionDate).getTime() + 86400000)
          }
        });

        if (alreadyProcessed) {
          console.log(`⏩ Skipping \( {node.email}: Already settled for \){sessionDate}`);
          continue;
        }

        const plan = node.activePlan || 'Tier I: Entry';
        const rate = RIO_DAILY_RATES[plan] || 0.00020;
        const principal = Number(node.balances.get('INVESTED') || 0);

        if (principal <= 0) continue;

        // Precise calculation (avoid JS float issues)
        let dailyYield = Math.round((principal * rate) * 100) / 100;   // 2 decimal precision

        // Special case override (keep if needed, but consider moving to DB config)
        if (node.email === 'gery.maes1@telenet.be' && principal === 110000) {
          dailyYield = 12.50;
        }

        if (dailyYield <= 0) continue;

        // Atomic update using $inc (safer than loading → modifying → saving)
        const updatedUser = await User.findOneAndUpdate(
          { _id: node._id },
          {
            $inc: {
              'balances.ROI': dailyYield,
              // Optional: auto-compound to INVESTED if your product allows
              // 'balances.INVESTED': dailyYield
            }
          },
          { new: true }
        );

        // Audit trail
        await Transaction.create({
          user: node._id,
          type: 'yield',
          amount: dailyYield,
          currency: 'EUR',
          status: 'completed',
          method: 'internal',
          description: `Alpha Protocol Settlement • \( {plan} • \){sessionDate}`,
          metadata: { rate, principal, plan }
        });

        console.log(`✅ [RIO] Credited \( {node.email}: +€ \){dailyYield.toFixed(2)} (${plan})`);

        // Real-time socket
        if (io && updatedUser) {
          io.to(node._id.toString()).emit('balanceUpdate', {
            balances: Object.fromEntries(updatedUser.balances),
            message: `📈 +€${dailyYield.toFixed(2)} Alpha Yield Distributed`
          });
        }
      } catch (nodeErr) {
        console.error(`❌ [RIO NODE ERROR] ${node.email}:`, nodeErr.message);
        // Continue with other nodes
      }
    }

    console.log(`--- [RIO ENGINE] Settlement Complete ---`);
  } catch (err) {
    console.error('❌ [RIO ENGINE FATAL]', err.message);
  }
};

export const initRioEngine = (io) => {
  console.log('⚙️ [RIO ENGINE] Alpha Protocol Synchronized');

  // Daily at midnight
  cron.schedule('0 0 * * *', () => runYieldDistribution(io));

  // Run once on startup for testing
  setTimeout(() => runYieldDistribution(io), 8000);
};
