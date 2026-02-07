import express from 'express';
import mongoose from 'mongoose';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @desc    Admin approves a pending deposit using a database session for atomicity
 * @route   PATCH /api/deposits/:id/approve
 */
router.patch('/:id/approve', protect, admin, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(req.params.id).session(session);

    if (!transaction || transaction.type !== 'deposit') {
      throw new ApiError(404, 'Deposit transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new ApiError(400, `Transaction is already ${transaction.status}`);
    }

    const currency = transaction.currency || 'USD';
    
    // Atomically update user balance and push to ledger
    const user = await User.findOneAndUpdate(
      { _id: transaction.user },
      { 
        $inc: { [`balances.${currency}`]: transaction.amount },
        $push: { 
          ledger: {
            amount: transaction.amount,
            signedAmount: Math.abs(transaction.amount),
            currency: currency,
            type: 'deposit',
            source: transaction.method || 'manual',
            status: 'completed',
            description: `Admin Approved: ${transaction.description || 'Deposit'}`,
            timestamp: new Date()
          }
        }
      },
      { session, new: true, runValidators: true }
    );

    if (!user) throw new ApiError(404, 'Investor account not found');

    // Finalize Transaction status
    transaction.status = 'completed';
    transaction.processedAt = new Date();
    transaction.processedBy = req.user.id;
    await transaction.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Deposit approved and balance updated',
      balances: user.balances
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Admin rejects a pending deposit
 * @route   PATCH /api/deposits/:id/reject
 */
router.patch('/:id/reject', protect, admin, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { 
        _id: req.params.id, 
        type: 'deposit', 
        status: 'pending' 
      },
      { 
        $set: { 
          status: 'rejected',
          processedAt: new Date(),
          processedBy: req.user.id
        } 
      },
      { new: true }
    );

    if (!transaction) {
      throw new ApiError(404, 'Pending deposit transaction not found');
    }

    res.json({ 
      success: true, 
      message: 'Deposit request rejected' 
    });
  } catch (err) {
    next(err);
  }
});

export default router;

