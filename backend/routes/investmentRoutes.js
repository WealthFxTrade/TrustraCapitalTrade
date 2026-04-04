import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js'; // Ensure you have a transaction model
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @desc    Get all active investment plans
 * @route   GET /api/investments
 */
router.get('/', asyncHandler(async (req, res) => {
    const plans = await Investment.find({ isActive: true }).sort({ minimumDeposit: 1 });
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
}));

/**
 * @desc    Subscribe user to plan & deduct principal
 * @route   POST /api/investments/subscribe/:planId
 */
router.post('/subscribe/:planId', protect, asyncHandler(async (req, res) => {
    const { planId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    // 1. Verify Strategy exists
    const plan = await Investment.findById(planId);
    if (!plan || !plan.isActive) {
      throw new ApiError(404, 'Investment strategy not found or currently inactive');
    }

    // 2. Protocol Check: One active plan limit
    if (user.activePlan) {
      throw new ApiError(400, 'User already has an active capital deployment');
    }

    // 3. Liquidity Check: Ensure user has enough EUR
    if (user.balances.EUR < plan.minimumDeposit) {
      throw new ApiError(400, `Insufficient Liquidity. Minimum €${plan.minimumDeposit.toLocaleString()} required.`);
    }

    // 4. ATOMIC EXECUTION: Deduct Balance & Update Profile
    user.balances.EUR -= plan.minimumDeposit;
    user.investedAmount = plan.minimumDeposit; 
    user.activePlan = plan.name;
    user.planStartDate = new Date();
    user.planEndDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    // 5. Audit Trail: Create Transaction Log
    await Transaction.create({
      user: user._id,
      type: 'investment',
      amount: plan.minimumDeposit,
      currency: 'EUR',
      status: 'completed',
      description: `Deployed to ${plan.name} Strategy`
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `Capital successfully deployed to ${plan.name}`,
      activePlan: user.activePlan,
      planEndDate: user.planEndDate,
      balances: user.balances
    });
}));

/**
 * @desc    Get the current active position
 * @route   GET /api/investments/current
 */
router.get('/current', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.activePlan) {
      return res.status(200).json({
        success: true,
        message: 'No active investment protocol found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activePlan: user.activePlan,
        investedAmount: user.investedAmount,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
      },
    });
}));

export default router;

