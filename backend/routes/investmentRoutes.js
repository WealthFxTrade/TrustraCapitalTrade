// routes/investmentRoutes.js

import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Investment from '../models/Investment.js'; // corrected import
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @desc Get available investment plans
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const plans = await Investment.find({ isActive: true }).sort({ durationDays: 1 });
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  })
);

/**
 * @desc Subscribe user to a plan
 */
router.post(
  '/subscribe/:planId',
  protect,
  asyncHandler(async (req, res) => {
    const { planId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    const plan = await Investment.findById(planId); // corrected
    if (!plan || !plan.isActive) throw new ApiError(404, 'Investment plan not found or inactive');

    if (user.activePlan) throw new ApiError(400, 'User already subscribed to a plan');

    user.activePlan = plan.name;
    user.planStartDate = new Date();
    user.planEndDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    await user.save();

    res.status(200).json({
      success: true,
      message: `Subscribed to ${plan.name} plan successfully`,
      activePlan: user.activePlan,
      planEndDate: user.planEndDate,
    });
  })
);

/**
 * @desc Get user's current investment plan
 */
router.get(
  '/current',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.activePlan) {
      return res.status(200).json({
        success: true,
        message: 'No active investment plan',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activePlan: user.activePlan,
        planStartDate: user.planStartDate,
        planEndDate: user.planEndDate,
      },
    });
  })
);

export default router;
