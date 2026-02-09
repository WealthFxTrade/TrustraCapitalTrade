import cron from 'node-cron';
import mongoose from 'mongoose';
import Investment from '../models/Investment.js';
import User from '../models/User.js';

/**
 * Trustra Capital - Automated ROI Node (Rio Series 2026)
 * Executes daily yield distribution at 00:00 (Midnight).
 * Uses Mongoose Sessions to ensure financial integrity.
 */
export const startRoiEngine = () => {
  // Cron Schedule: 00:00 every day
  cron.schedule('0 0 * * *', async () => {
    console.log('--- [ROI_ENGINE] Initiating Daily Yield Distribution ---');
    
    // 1. Fetch all active investment nodes
    const activePlans = await Investment.find({ status: 'active' });
    if (activePlans.length === 0) return console.log('[ROI_ENGINE] No active nodes found.');

    for (const plan of activePlans) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // 2. Calculate profit (e.g., 1000 EUR * 2.2% = 22 EUR)
        const dailyProfit = (plan.amount * plan.dailyRoi) / 100;

        // 3. Update User Balance & Ledger
        const user = await User.findById(plan.user).session(session);
        if (!user) throw new Error('User node not found');

        const currentEUR = user.balances.get('EUR') || 0;
        user.balances.set('EUR', currentEUR + dailyProfit);

        user.ledger.push({
          amount: dailyProfit,
          currency: 'EUR',
          type: 'roi_profit',
          status: 'completed',
          description: `Daily Yield: ${plan.planName} Protocol`,
          createdAt: new Date()
        });

        // 4. Update Plan Progress
        plan.totalReturn += dailyProfit;
        plan.lastRoiAt = new Date();

        // 5. Handle Maturity (Plan Completion)
        if (new Date() >= plan.endsAt) {
          plan.status = 'completed';
          // Auto-refund the original capital to the EUR Node
          const balAfterProfit = user.balances.get('EUR');
          user.balances.set('EUR', balAfterProfit + plan.amount);
          
          user.ledger.push({
            amount: plan.amount,
            currency: 'EUR',
            type: 'deposit',
            status: 'completed',
            description: `Maturity Refund: ${plan.planName} Capital`,
            createdAt: new Date()
          });
        }

        // 6. Atomic Save
        user.markModified('balances');
        user.markModified('ledger');
        await user.save({ session });
        await plan.save({ session });

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        console.error(`❌ [ROI_SYNC_FAILED] Plan ${plan._id}: ${err.message}`);
      } finally {
        session.endSession();
      }
    }
    console.log(`--- [ROI_ENGINE] Distribution Sync Complete ---`);
  });
};

