// controllers/investmentController.js
import { applyTransaction } from '../services/financeService.js';
import Investment from '../models/Investment.js';
import { ApiError } from '../middleware/errorMiddleware.js';

// ── CREATE INVESTMENT ──
export const createInvestment = async (req, res, next) => {
  try {
    const { amount, planKey, planName, durationDays, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    const userBalance = req.user.balances.get(currency) || 0;
    if (userBalance < amount) throw new ApiError(400, 'Insufficient balance');

    // Deduct user balance and create ledger entry
    await applyTransaction({
      userId,
      type: 'investment',
      amount,
      currency,
      status: 'completed',
      description: `Investment in ${planName}`,
    });

    // Create investment record
    const investment = await Investment.create({
      user: userId,
      planKey,
      planName,
      amount,
      currency,
      durationDays,
    });

    // Emit real-time update to frontend
    const io = req.app.get('io');
    if (io) io.to(userId.toString()).emit('portfolioUpdate', investment);

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET MY INVESTMENTS ──
export const getMyInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, investments });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE INVESTMENT ──
export const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });
    if (!investment) throw new ApiError(404, 'Investment not found');

    const { planName, durationDays, amount } = req.body;
    if (planName) investment.planName = planName;
    if (durationDays) investment.durationDays = durationDays;
    if (amount) investment.amount = amount;

    await investment.save();

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('portfolioUpdate', investment);

    res.status(200).json({ success: true, investment });
  } catch (err) {
    next(err);
  }
};

// ── DELETE INVESTMENT ──
export const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!investment) throw new ApiError(404, 'Investment not found');

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('portfolioUpdate', { deleted: true, id: req.params.id });

    res.status(200).json({ success: true, message: 'Investment deleted' });
  } catch (err) {
    next(err);
  }
};
