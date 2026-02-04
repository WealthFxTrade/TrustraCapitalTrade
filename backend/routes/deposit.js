import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/* ---------------- APPROVE DEPOSIT (ADMIN) ---------------- */
/**
 * @desc    Admin approves a pending deposit and updates user balance
 * @route   PATCH /api/deposits/:id/approve
 */
router.patch('/:id/approve', protect, admin, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.type !== 'deposit') {
      throw new ApiError(404, 'Deposit transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new ApiError(400, `Transaction is already ${transaction.status}`);
    }

    const user = await User.findById(transaction.user);
    if (!user) throw new ApiError(404, 'Investor account not found');

    // 1. Update balances map
    const currency = transaction.currency || 'USD';
    const currentBalance = user.balances.get(currency) || 0;
    user.balances.set(currency, currentBalance + transaction.amount);

    // 2. Add to Ledger array for history
    user.ledger.push({
      amount: transaction.amount,
      signedAmount: Math.abs(transaction.amount),
      currency: currency,
      type: 'deposit',
      source: transaction.method || 'manual',
      status: 'completed',
      description: `Admin Approved: ${transaction.description || 'Deposit'}`
    });

    // 3. Finalize Transaction status
    transaction.status = 'completed';
    
    await Promise.all([user.save(), transaction.save()]);

    res.json({
      success: true,
      message: 'Deposit approved and balance updated',
      balances: user.balances
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- REJECT DEPOSIT (ADMIN) ---------------- */
router.patch('/:id/reject', protect, admin, async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) throw new ApiError(404, 'Transaction not found');

    transaction.status = 'rejected';
    await transaction.save();

    res.json({ success: true, message: 'Deposit request rejected' });
  } catch (err) {
    next(err);
  }
});

export default router;

