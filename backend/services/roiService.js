import Investment from '../models/Investment.js';
import User from '../models/User.js';

/**
 * Trustra ROI Engine v8.4.2
 * High-precision distribution with automated maturity handling.
 */
export const distributeDailyRoi = async () => {
  const startTime = Date.now();
  console.log("--- [ROI ENGINE] Protocol Initiated ---");
  
  try {
    const activePlans = await Investment.find({ status: 'active' });
    
    if (activePlans.length === 0) {
      return console.log("--- [ROI ENGINE] No active nodes found. Idle. ---");
    }

    for (const plan of activePlans) {
      try {
        // 1. Precise Profit Calculation
        const dailyProfit = Number(((plan.amount * plan.dailyRoi) / 100).toFixed(2));

        // 2. Atomic User Update
        const user = await User.findById(plan.user);
        if (!user) continue;

        const currentEur = user.balances.get('EUR') || 0;
        const currentTotalProfit = user.totalProfit || 0;

        // Add profit to EUR balance and global profit counter
        user.balances.set('EUR', Number((currentEur + dailyProfit).toFixed(2)));
        user.totalProfit = Number((currentTotalProfit + dailyProfit).toFixed(2));

        // 3. Update Investment Record
        plan.totalReturn = Number((plan.totalReturn + dailyProfit).toFixed(2));
        plan.lastRoiAt = new Date();

        // 4. Maturity Handling (End of Cycle)
        const isMatured = new Date() >= new Date(plan.endsAt);
        if (isMatured) {
          plan.status = 'completed';
          // Return original seed capital to the balance
          const balanceWithCapital = user.balances.get('EUR') + plan.amount;
          user.balances.set('EUR', Number(balanceWithCapital.toFixed(2)));
          
          console.log(`[MATURITY] Node ${plan._id} completed. Capital returned to ${user.email}`);
        }

        // 5. Persist Changes
        user.markModified('balances');
        await user.save();
        await plan.save();

      } catch (err) {
        console.error(`[ROI ENGINE ERROR] Plan ${plan._id}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`--- [ROI ENGINE] Distribution Complete (${duration}ms) ---`);
  } catch (globalErr) {
    console.error("--- [ROI ENGINE] Critical System Failure ---", globalErr);
  }
};
