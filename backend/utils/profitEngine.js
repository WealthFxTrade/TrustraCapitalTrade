import cron from 'node-cron';
import User from '../models/User.js';
import { sendEmail } from './sendEmail.js';

// Protocol yield rates per 24h cycle
const NODE_RATES = {
  'Standard Node': 0.012, // 1.2%
  'Premium Node': 0.025,  // 2.5%
  'Elite Node': 0.048,    // 4.8%
  'Institutional': 0.075  // 7.5%
};

/**
 * @desc Automated Yield Distribution Logic
 * Scheduled for 00:00 Server Time (Zurich)
 */
export const initializeProfitDistributor = () => {
  // Cron schedule: Runs every night at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[SYSTEM] Initializing daily yield distribution sequence...');
    
    try {
      const activeUsers = await User.find({ 
        isActive: true, 
        banned: false,
        totalBalance: { $gt: 0 } 
      });

      for (let user of activeUsers) {
        const rate = NODE_RATES[user.activePlan] || 0.01;
        const accruedAmount = user.totalBalance * rate;

        // 1. Update Map-based ROI balance
        const currentRoi = user.balances.get('ROI') || 0;
        user.balances.set('ROI', currentRoi + accruedAmount);
        
        // 2. Update Total Profit aggregator
        user.totalProfit += accruedAmount;

        // 3. Inject Ledger Entry
        user.ledger.push({
          amount: accruedAmount,
          currency: 'ROI',
          type: 'investment',
          status: 'completed',
          description: `Daily Yield Accrual: ${user.activePlan} Node`,
          createdAt: new Date()
        });

        // 4. Save state with Mongoose Map protection
        user.markModified('balances');
        user.markModified('ledger');
        await user.save();

        // 5. Optional: Notify user of successful accrual
        /*
        await sendEmail({
          email: user.email,
          subject: "Trustra Yield Distribution",
          message: `Your ${user.activePlan} has successfully accrued €${accruedAmount.toFixed(2)}.`
        });
        */
      }
      console.log(`[SYSTEM] Distribution complete. ${activeUsers.length} nodes updated.`);
    } catch (err) {
      console.error('[CRITICAL] Yield distribution protocol failure:', err);
    }
  });
};
