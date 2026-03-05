import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @protocol requestWithdrawal
 * @desc    Validates ROI balance and creates a pending extraction request in the ledger.
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, currency, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) throw new ApiError(404, "User node not found.");

    const withdrawalAmount = parseFloat(amount);

    // 1. Minimum Threshold Security (Standard Zurich Protocol)
    if (withdrawalAmount < 50) {
      throw new ApiError(400, "Minimum extraction threshold is €50.");
    }

    // 2. ROI Balance Validation
    const availableRoi = user.balances.get('ROI') || 0;

    if (availableRoi < withdrawalAmount) {
      throw new ApiError(400, "Insufficient ROI balance for this extraction.");
    }

    // 3. Deduction Protocol (Immediate Hold)
    // Funds are held to prevent double-spending during HQ review.
    user.balances.set('ROI', availableRoi - withdrawalAmount);

    // 4. Record in Immutable Ledger
    user.ledger.push({
      amount: withdrawalAmount,
      currency: currency || 'EUR',
      address: address, // The destination wallet address
      type: 'withdrawal',
      status: 'pending',
      description: `Extraction request to: ${address}`,
      createdAt: new Date()
    });

    // 5. State Synchronization
    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    res.status(200).json({
      success: true,
      message: "Extraction request transmitted to Zurich HQ. Status: Pending.",
      balances: Object.fromEntries(user.balances)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @protocol cancelWithdrawal
 * @desc    Allows a user to retract a pending request and automatically refund their ROI wallet.
 */
export const cancelWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params; // The unique ID of the ledger entry
    const user = await User.findById(req.user._id);

    // Access the specific sub-document in the ledger array
    const entry = user.ledger.id(id);

    if (!entry) throw new ApiError(404, "Transaction record not found.");
    if (entry.status !== 'pending') throw new ApiError(400, "Cannot retract a processed transaction.");

    // 1. Refund Protocol
    const currentRoi = user.balances.get('ROI') || 0;
    user.balances.set('ROI', currentRoi + entry.amount);

    // 2. Update Entry Status for Audit Trail
    entry.status = 'cancelled';
    entry.description += " | User retracted request.";

    user.markModified('balances');
    user.markModified('ledger');
    await user.save();

    res.status(200).json({
      success: true,
      message: "Extraction retracted. Funds restored to ROI node.",
      balances: Object.fromEntries(user.balances)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @protocol getMyWithdrawals
 * @desc    Synchronizes with routes/withdrawalRoutes.js to provide user-specific history.
 */
export const getMyWithdrawals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ledger');
    
    // Filter for withdrawal types and sort by date descending
    const extractions = user.ledger
      .filter(item => item.type === 'withdrawal')
      .sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      withdrawals: extractions
    });
  } catch (err) {
    next(err);
  }
};
