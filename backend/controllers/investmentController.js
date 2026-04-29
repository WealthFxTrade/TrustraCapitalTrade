// controllers/investmentController.js
import { applyTransaction } from '../services/financeService.js';
import Investment from '../models/Investment.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * ── CREATE INVESTMENT ──
 * Atomic operation to deduct EUR and move it to the INVESTED vault
 */
export const createInvestment = async (req, res, next) => {
  try {
    const { amount, planKey, planName, durationDays, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid investment amount');

    /**
     * 1. ATOMIC DEDUCTION & VAULT TRANSFER
     * We only update the user if their balance is greater than or equal to the amount.
     * This prevents race conditions and double-spending.
     */
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId, 
        [`balances.${currency}`]: { $gte: amount } 
      },
      {
        $inc: { 
          [`balances.${currency}`]: -Number(amount),
          'balances.INVESTED': Number(amount) 
        },
        $set: { activePlan: planName } // Tier I: Entry, etc.
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(400, 'Insufficient vault balance or account error');
    }

    /**
     * 2. LEDGER RECORDING
     * Create the transaction history entry for the user.
     */
    await applyTransaction({
      userId,
      type: 'investment',
      amount,
      currency,
      status: 'completed',
      description: `Capital Commitment: ${planName}`,
    });

    /**
     * 3. INVESTMENT LOGGING
     * Create a detailed record of the investment plan.
     */
    const investment = await Investment.create({
      user: userId,
      planKey,
      planName,
      amount,
      currency,
      durationDays,
      status: 'active'
    });

    /**
     * 4. REAL-TIME SYNC
     * Immediately push updated balances to the user's dashboard via Socket.io
     */
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('balanceUpdate', {
        balances: Object.fromEntries(updatedUser.balances),
        message: `🚀 [NODE ACTIVATED] ${planName} is now generating yield.`
      });
      io.to(userId.toString()).emit('portfolioUpdate', investment);
    }

    res.status(201).json({
      success: true,
      message: 'Node synchronized. Principal is now yielding daily.',
      investment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ── GET ACTIVE NODES ──
 */
export const getMyInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, investments });
  } catch (err) {
    next(err);
  }
};

/**
 * ── LIQUIDATE NODE (REFUND) ──
 */
export const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });
    if (!investment) throw new ApiError(404, 'Node record not found');

    // Refund Logic: Atomic reversal
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'balances.EUR': investment.amount,
        'balances.INVESTED': -investment.amount
      },
      $set: { activePlan: 'None' }
    }, { new: true });

    await Investment.deleteOne({ _id: req.params.id });

    const io = req.app.get('io');
    if (io && updatedUser) {
      io.to(req.user._id.toString()).emit('balanceUpdate', { 
        balances: Object.fromEntries(updatedUser.balances),
        message: 'Node Liquidated: Capital returned to available balance' 
      });
    }

    res.status(200).json({ success: true, message: 'Liquidation complete' });
  } catch (err) {
    next(err);
  }
};

