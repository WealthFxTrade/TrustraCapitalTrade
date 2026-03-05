import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @protocol subscribeToPlan
 * @desc    Deducts principal from liquid balance and activates a Rio Yield Node
 */
export const subscribeToPlan = async (req, res, next) => {
  try {
    const { planName, amount } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) throw new ApiError(404, "User node not found.");

    // 1. Check Liquid Liquidity (EUR balance)
    const liquidBalance = user.balances.get('EUR') || 0;
    const investmentAmount = parseFloat(amount);

    if (liquidBalance < investmentAmount) {
      throw new ApiError(400, "Insufficient liquid EUR to initiate investment.");
    }

    // 2. Perform Atomic Swap: Liquid -> Invested
    // Deduct from EUR Map
    user.balances.set('EUR', liquidBalance - investmentAmount);
    
    // Add to Active Investment Principal
    // Note: We track this so the Profit Engine knows the 'Principal'
    user.totalBalance = (user.totalBalance || 0) + investmentAmount;

    // 3. Set the Protocol Tier
    user.activePlan = planName;
    user.isActive = true;

    // 4. Update Ledger
    user.ledger.push({
      amount: investmentAmount,
      currency: 'EUR',
      type: 'investment',
      status: 'completed',
      description: `Subscription: ${planName} Activation`
    });

    // 5. Save and Synchronize
    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    res.status(200).json({
      success: true,
      message: `${planName} Node Activated. Yield distribution begins at 00:00 UTC.`,
      balances: Object.fromEntries(user.balances)
    });
  } catch (err) {
    next(err);
  }
};
