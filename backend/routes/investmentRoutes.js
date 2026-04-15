import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
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
 * @desc    Subscribe user to plan & deduct principal (Map-Compatible)
 * @route   POST /api/investments/subscribe/:planId
 */
router.post('/subscribe/:planId', protect, asyncHandler(async (req, res) => {
    const { planId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    const plan = await Investment.findById(planId);
    if (!plan || !plan.isActive) {
        throw new ApiError(404, 'Investment strategy not found or currently inactive');
    }

    // 1. Protocol Check: Allow upgrade or one-plan limit
    if (user.activePlan && user.activePlan !== 'None') {
        throw new ApiError(400, 'User already has an active capital deployment');
    }

    // 2. Map-Safe Liquidity Check
    const currentEur = Number(user.balances.get('EUR') || 0);
    if (currentEur < plan.minimumDeposit) {
        throw new ApiError(400, `Insufficient Liquidity. Minimum €${plan.minimumDeposit.toLocaleString()} required.`);
    }

    // 3. ATOMIC EXECUTION: Update Balances via .set()
    user.balances.set('EUR', Number((currentEur - plan.minimumDeposit).toFixed(2)));
    
    // Provision INVESTED capital for ROI Engine to track
    const currentInvested = Number(user.balances.get('INVESTED') || 0);
    user.balances.set('INVESTED', currentInvested + plan.minimumDeposit);

    user.activePlan = plan.name;
    user.planStartDate = new Date();
    user.planEndDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    // 4. Audit Trail: Create Transaction Log
    await Transaction.create({
        user: user._id,
        type: 'investment',
        amount: plan.minimumDeposit,
        currency: 'EUR',
        status: 'completed',
        description: `Deployed to ${plan.name} Strategy`
    });

    user.markModified('balances'); // Mandatory for Mongoose Maps
    await user.save();

    res.status(200).json({
        success: true,
        message: `Capital successfully deployed to ${plan.name}`,
        activePlan: user.activePlan,
        balances: Object.fromEntries(user.balances)
    });
}));

/**
 * @desc    Get the current active position
 * @route   GET /api/investments/current
 */
router.get('/current', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    res.status(200).json({
        success: true,
        data: {
            activePlan: user.activePlan || 'None',
            investedAmount: user.balances.get('INVESTED') || 0,
            planStartDate: user.planStartDate,
            planEndDate: user.planEndDate,
        },
    });
}));

export default router;

