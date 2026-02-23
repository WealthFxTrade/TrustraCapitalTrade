import Plan from '../models/Plan.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const investInPlan = async (req, res, next) => {
  try {
    const { planName, amount } = req.body; // e.g., { "planName": "Rio Basic", "amount": 1200 }
    const user = await User.findById(req.user.id);
    const plan = await Plan.findOne({ name: planName });

    if (!plan) throw new ApiError(404, 'Investment plan not found');

    // 1. Validate Amount against Tier Limits
    if (amount < plan.minDeposit || amount > plan.maxDeposit) {
      throw new ApiError(400, `Amount for ${plan.name} must be between $${plan.minDeposit} and $${plan.maxDeposit}`);
    }

    // 2. Check User USD Balance
    const currentUsd = user.balances.get('USD') || 0;
    if (currentUsd < amount) {
      throw new ApiError(400, 'Insufficient USD balance to complete investment');
    }

    // 3. Process Investment
    user.balances.set('USD', currentUsd - amount);
    user.plan = plan.name;
    user.isPlanActive = true;
    
    // 4. Record in Ledger
    user.ledger.push({
      amount: amount,
      currency: 'USD',
      type: 'investment',
      status: 'completed',
      createdAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: `Successfully invested $${amount} in ${plan.name}`,
      newBalance: user.balances.get('USD'),
      plan: user.plan
    });
  } catch (err) {
    next(err);
  }
};

