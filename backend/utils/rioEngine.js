import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * 🌘 RIO ENGINE (ROI Distribution)
 * Handles daily yield distribution based on investment tiers.
 */
const RIO_DAILY_RATES = {
  'Tier I: Entry': 0.00020,         // ~0.6% Monthly
  'Tier II: Core': 0.00028,         // ~0.84% Monthly
  'Tier III: Prime': 0.00038,        // ~1.14% Monthly
  'Tier IV: Institutional': 0.00049, // ~1.47% Monthly
  'Tier V: Sovereign': 0.00061,      // ~1.83% Monthly
  'Sovereign': 0.00061,
  'Rio Elite': 0.00061,
};

/**
 * Distributes yield to all active investment nodes
 */
export const runYieldDistribution = async (io) => {
  const sessionDate = new Date().toISOString().split('T')[0];
  console.log(`🌘 [RIO ENGINE] EXECUTING SETTLEMENT: ${sessionDate}`);

  try {
    const activeNodes = await User.find({
      isActive: true,
      isBanned: false,
      activePlan: { $ne: 'None' },
      'balances.INVESTED': { $gt: 0 }
    }).select('_id email activePlan balances');

    console.log(`📡 [RIO ENGINE] Processing ${activeNodes.length} Active Nodes...`);

    for (const node of activeNodes) {
      try {
        // 1. Daily Idempotency Check: Prevent paying the same user twice in one day
        const alreadyProcessed = await Transaction.findOne({
          user: node._id,
          type: 'yield',
          createdAt: {
            $gte: new Date(sessionDate),
            $lt: new Date(new Date(sessionDate).getTime() + 24 * 60 * 60 * 1000)
          }
        });

        if (alreadyProcessed) {
          console.log(`⏩ Skipping ${node.email}: Already settled for ${sessionDate}`);
          continue;
        }

        // 2. Calculate Yield
        const dailyRate = RIO_DAILY_RATES[node.activePlan] || 0.00015; // Default low rate if plan not found
        const principal = node.balances.get('INVESTED') || 0;
        const yieldAmount = principal * dailyRate;

        if (yieldAmount <= 0) continue;

        // 3. Atomic Database Update
        const updatedUser = await User.findOneAndUpdate(
          { _id: node._id },
          {
            $inc: {
              'balances.EUR': Number(yieldAmount.toFixed(2)),
              'balances.TOTAL_PROFIT': Number(yieldAmount.toFixed(2))
            }
          },
          { new: true }
        );

        // 4. Create Audit Trail
        await Transaction.create({
          user: node._id,
          type: 'yield',
          amount: Number(yieldAmount.toFixed(2)),
          currency: 'EUR',
          status: 'completed',
          description: `Daily Yield Settlement (${node.activePlan})`,
          metadata: {
            principalAtTime: principal,
            rateUsed: dailyRate,
            sessionDate: sessionDate
          }
        });

        console.log(`💰 [RIO] ${node.email}: +€${yieldAmount.toFixed(2)} (Rate: ${dailyRate})`);

        // 5. Real-time Notification
        if (io && updatedUser) {
          io.to(node._id.toString()).emit('balanceUpdate', {
            balances: Object.fromEntries(updatedUser.balances),
            message: `🌘 Daily yield received: +€${yieldAmount.toFixed(2)}`
          });
        }

      } catch (nodeErr) {
        console.error(`❌ [RIO ERROR] Node ${node.email}:`, nodeErr.message);
      }
    }

    console.log(`--- [RIO ENGINE] Settlement Complete for ${sessionDate} ---`);
  } catch (err) {
    console.error('⚠️ [RIO ENGINE FATAL ERROR]:', err.message);
  }
};

/**
 * Initialize the Engine
 * Default: Runs every midnight (00:00)
 */
export const initRioEngine = (io) => {
  console.log('⚙️ [RIO ENGINE] Alpha Protocol Synchronized');
  
  // Schedule: Once daily at midnight
  cron.schedule('0 0 * * *', () => {
    runYieldDistribution(io);
  });

  // Optional: Run once on startup for development testing (can be commented out for production)
  // setTimeout(() => runYieldDistribution(io), 5000); 
};

