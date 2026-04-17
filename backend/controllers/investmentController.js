// controllers/investmentController.js
import { applyTransaction } from '../services/financeService.js';
import Investment from '../models/Investment.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * ── CREATE INVESTMENT ──
 * Deducts EUR and moves it to the INVESTED vault for ROI generation
 */
export const createInvestment = async (req, res, next) => {
  try {
    const { amount, planKey, planName, durationDays, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    // 1. Validate Balance
    const user = await User.findById(userId);
    const userBalance = user.balances.get(currency) || 0;
    if (userBalance < amount) throw new ApiError(400, 'Insufficient vault balance');

    // 2. Process Deduction & Ledger Entry
    // This handles the Transaction record and the decrement of EUR
    await applyTransaction({
      userId,
      type: 'investment',
      amount,
      currency,
      status: 'completed',
      description: `Capital Commitment: ${planName}`,
    });

    // 3. Move Funds to INVESTED & Set Active Plan
    // This is the "Bridge" to the RIO Engine
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { 'balances.INVESTED': Number(amount) },
        $set: { activePlan: planName } // Sets the tier for the ROI engine
      },
      { new: true }
    );

    // 4. Create Investment Record
    const investment = await Investment.create({
      user: userId,
      planKey,
      planName,
      amount,
      currency,
      durationDays,
      status: 'active'
    });

    // 5. Real-Time Sync to Dashboard
    const io = req.app.get('io');
    if (io && updatedUser) {
      // Notifies the dashboard to update the "Principal" and "Available" numbers instantly
      io.to(userId.toString()).emit('balanceUpdate', {
        balances: Object.fromEntries(updatedUser.balances),
        message: `🚀 Investment Active: ${planName} Plan`
      });
      io.to(userId.toString()).emit('portfolioUpdate', investment);
    }

    res.status(201).json({
      success: true,
      message: 'Investment successful. Principal is now yielding.',
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

// ── DELETE/CANCEL INVESTMENT (Optional Admin Logic) ──
export const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });
    if (!investment) throw new ApiError(404, 'Investment not found');

    // Refund Logic: Move INVESTED back to EUR
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'balances.EUR': investment.amount,
        'balances.INVESTED': -investment.amount 
      },
      $set: { activePlan: 'None' }
    });

    await Investment.deleteOne({ _id: req.params.id });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('balanceUpdate', { message: 'Investment Cancelled & Refunded' });

    res.status(200).json({ success: true, message: 'Investment liquidated to available balance' });
  } catch (err) {
    next(err);
  }
};

