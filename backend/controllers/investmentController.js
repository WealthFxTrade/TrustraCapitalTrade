import { applyTransaction } from '../services/financeService.js';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const createInvestment = async (req, res, next) => {
  try {
    const { amount, planKey, planName, durationDays, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const userBalance = user.balances.get(currency) || 0;

    if (userBalance < amount) throw new ApiError(400, 'Insufficient balance');

    // Deduct balance via transaction
    await applyTransaction({
      userId,
      type: 'investment',
      amount,
      currency,
      status: 'completed',
      description: `Investment in ${planName}`
    });

    // Create investment record
    const investment = await Investment.create({
      user: userId,
      planKey,
      planName,
      amount,
      currency,
      durationDays
    });

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment
    });
  } catch (err) {
    next(err);
  }
};

export const getMyInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, investments });
  } catch (err) {
    next(err);
  }
};
