import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * Trustra ROI Engine v8.5.0 
 * High-precision distribution with automated maturity handling.
 */
export const distributeDailyRoi = async () => {
  const startTime = Date.now();
  console.log("--- [ROI ENGINE] Protocol Initiated ---");

  try {
    // Only target active investment nodes
    const activePlans = await Investment.find({ status: 'active' });
    
    if (activePlans.length === 0) {
      return console.log("--- [ROI ENGINE] No active nodes found. Idle. ---");
    }

    for (const plan of activePlans) {
      try {
        const user = await User.findById(plan.user);
        if (!user) continue;

        // 1. Precise Profit Calculation
        // Formula: (Principal * Daily %) / 100
        const dailyProfit = Number(((plan.amount * plan.dailyRoi) / 100).toFixed(2));
        
        // 2. Vault Separation (Institutional Standard)
        // Profit flows to 'ROI' vault, keeping 'EUR' principal pure.
        const currentRoi = user.balances.get('ROI') || 0;
        user.balances.set('ROI', Number((currentRoi + dailyProfit).toFixed(2)));
        
        // Update global user analytics
        user.totalProfit = Number(((user.totalProfit || 0) + dailyProfit).toFixed(2));

        // 3. Update Investment Node Stats
        plan.totalReturn = Number((plan.totalReturn + dailyProfit).toFixed(2));
        plan.lastRoiAt = new Date();

        // 4. Maturity Handling (End of Contract)
        const isMatured = new Date() >= new Date(plan.endsAt);
        if (isMatured) {
          plan.status = 'completed';
          
          // Return the original seed capital to the 'EUR' balance
          const currentEur = user.balances.get('EUR') || 0;
          user.balances.set('EUR', Number((currentEur + plan.amount).toFixed(2)));
          
          console.log(`[MATURITY] Node ${plan._id} finalized. €${plan.amount} returned to principal.`);
        }

        // 5. Create Ledger Entry for User Frontend
        await Transaction.create({
          user: user._id,
          type: 'roi_credit',
          amount: dailyProfit,
          currency: 'EUR',
          status: 'completed',
          description: `Institutional Yield: ${plan.name || 'Alpha Strategy'}`
        });

        // 6. Atomic Persistence
        user.markModified('balances');
        await user.save();
        await plan.save();

      } catch (err) {
        console.error(`[ROI ENGINE ERROR] Node ${plan._id}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`--- [ROI ENGINE] Distribution Complete (${duration}ms) ---`);
  } catch (globalErr) {
    console.error("--- [ROI ENGINE] Critical System Failure ---", globalErr);
  }
};
