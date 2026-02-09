import Investment from '../models/Investment.js';
import User from '../models/User.js';

/**
 * Trustra ROI Engine
 * Iterates through active plans and adds daily percentage to user balances.
 */
export const distributeDailyRoi = async () => {
  console.log("--- [ROI ENGINE] Starting Distribution ---");
  const activePlans = await Investment.find({ status: 'active' });

  for (const plan of activePlans) {
    try {
      const dailyProfit = (plan.amount * plan.dailyRoi) / 100;
      
      // Update User Balance (EUR Node)
      const user = await User.findById(plan.user);
      const currentBalance = user.balances.get('EUR') || 0;
      user.balances.set('EUR', currentBalance + dailyProfit);
      
      // Update Investment Record
      plan.totalReturn += dailyProfit;
      plan.lastRoiAt = new Date();

      // Check for Maturity
      if (new Date() >= plan.endsAt) {
        plan.status = 'completed';
        // Optional: Return original capital here
        user.balances.set('EUR', user.balances.get('EUR') + plan.amount);
      }

      user.markModified('balances');
      await user.save();
      await plan.save();
      
    } catch (err) {
      console.error(`ROI Error for Plan ${plan._id}:`, err.message);
    }
  }
};

