import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/transactions/withdraw
 * @desc    Create a withdrawal request for the logged-in user
 * @access  Private
 */
router.post('/withdraw', protect, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, currency, walletAddress } = req.body;

    if (!amount || !currency || !walletAddress) {
      throw new ApiError(400, 'Amount, currency, and wallet address are required');
    }

    // 1. Find user within the session to prevent race conditions
    const user = await User.findById(req.user.id).session(session);
    if (!user) throw new ApiError(404, 'User not found');

    const currentBalance = user.balances.get(currency) || 0;
    if (currentBalance < amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    // 2. Create the transaction record
    const [tx] = await Transaction.create(
      [
        {
          user: user._id,
          type: 'withdrawal',
          amount,
          signedAmount: -amount,
          currency,
          walletAddress,
          status: 'pending',
          method: 'crypto',
        },
      ],
      { session }
    );

    // 3. Update user balance
    user.balances.set(currency, currentBalance - amount);

    // 4. Add to user's ledger
    user.ledger.push({
      amount,
      signedAmount: -amount,
      currency,
      type: 'withdrawal',
      status: 'pending',
      referenceId: tx._id,
      description: `Withdrawal request to ${walletAddress}`,
    });

    // 5. Save user changes
    await user.save({ session });

    // 6. Commit transaction
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Withdrawal pending admin approval',
      balances: user.balances,
    });
  } catch (err) {
    // Rollback on error
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

export default router;
