import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @protocol subscribeToPlan
 * @desc    Deducts principal from liquid balance and activates a Rio Yield Node
 * @route   POST /api/user/invest
 */
export const subscribeToPlan = async (req, res, next) => {
  try {
    // 🚨 SYNCHRONIZATION FIX: Support both 'plan' and 'planName' from frontend
    const { plan, planName, amount } = req.body;
    const selectedPlan = plan || planName; 
    
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User node not found.");

    // 1. Validation Logic
    const investmentAmount = parseFloat(amount);
    if (!selectedPlan || isNaN(investmentAmount) || investmentAmount <= 0) {
      throw new ApiError(400, "Invalid plan selection or investment amount.");
    }

    // 2. Check Liquid Liquidity (EUR balance)
    const liquidBalance = user.balances.get('EUR') || 0;

    if (liquidBalance < investmentAmount) {
      throw new ApiError(400, `Insufficient EUR liquidity. Required: €${investmentAmount}, Available: €${liquidBalance}`);
    }

    // 3. Perform Atomic Swap: Liquid -> Invested
    // We deduct from the liquid 'EUR' wallet. 
    // The Rio Engine then calculates yield based on the remaining balance or a separate 'INVESTED' key if you prefer.
    user.balances.set('EUR', liquidBalance - investmentAmount);

    // 4. Update Investment State
    // If you want the Engine to calculate based on the "Invested" amount, 
    // you should store that amount in a specific field or Map key.
    const currentInvested = user.balances.get('INVESTED') || 0;
    user.balances.set('INVESTED', currentInvested + investmentAmount);

    user.activePlan = selectedPlan;
    user.isActive = true;

    // Set lastRoiAt to now to prevent double-dipping if the cron runs shortly after
    user.lastRoiAt = new Date();

    // 5. Update Ledger
    user.ledger.push({
      amount: -investmentAmount,
      currency: 'EUR',
      type: 'investment',
      status: 'completed',
      description: `PROTOCOL ACTIVATION: ${selectedPlan.toUpperCase()} Node Initialized`,
      createdAt: new Date()
    });

    // 6. Save and Synchronize
    // markModified is MANDATORY for Mongoose Maps
    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    // 7. Real-time Socket Update
    const io = req.app.get('io');
    if (io) {
      io.to(user._id.toString()).emit('balanceUpdate', {
        balances: Object.fromEntries(user.balances),
        activePlan: user.activePlan,
        message: `Plan ${selectedPlan} activated successfully.`
      });
    }

    res.status(200).json({
      success: true,
      message: `${selectedPlan} Node Activated. Yield distribution begins at 00:00 UTC.`,
      balances: Object.fromEntries(user.balances),
      activePlan: user.activePlan
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current investment status
 */
export const getInvestmentStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('activePlan lastRoiAt balances');
    res.status(200).json({
      success: true,
      data: {
        activePlan: user.activePlan,
        lastRoiAt: user.lastRoiAt,
        invested: user.balances.get('INVESTED') || 0
      }
    });
  } catch (err) {
    next(err);
  }
};
