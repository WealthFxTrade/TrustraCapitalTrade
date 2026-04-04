// controllers/withdrawalController.js
import { applyTransaction } from '../services/financeService.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

// ── REQUEST WITHDRAWAL ──
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, currency = 'EUR', address } = req.body;
    const userId = req.user._id;

    if (!amount || amount < 50) throw new ApiError(400, 'Minimum withdrawal is €50');

    const { transaction } = await applyTransaction({
      userId,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending',
      walletAddress: address,
      description: 'User withdrawal request',
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request created – pending approval',
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

// ── CANCEL WITHDRAWAL ──
export const cancelWithdrawal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const user = await User.findById(userId);
    const entry = user.ledger.id(id);

    if (!entry) throw new ApiError(404, 'Ledger entry not found');
    if (entry.status !== 'pending') throw new ApiError(400, 'Cannot cancel processed transaction');

    // Refund balance
    const prevBalance = user.balances.get(entry.currency) || 0;
    user.balances.set(entry.currency, prevBalance + entry.amount);

    entry.status = 'cancelled';
    entry.description += ' | User cancelled withdrawal';
    user.markModified('balances');
    user.markModified('ledger');

    await user.save();

    const io = req.app.get('io');
    if (io) io.to(userId.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      message: 'Withdrawal cancelled and funds refunded',
      ledgerEntry: entry,
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal cancelled and funds refunded',
      ledgerEntry: entry,
    });
  } catch (err) {
    next(err);
  }
};
