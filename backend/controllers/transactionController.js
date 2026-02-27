// controllers/transactionController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import { ApiError } from '../middleware/errorMiddleware.js';

export const initiateWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, destination, currency = 'EUR' } = req.body;
    const userId = req.user._id;

    if (currency !== 'EUR') {
      throw new ApiError(400, 'Only EUR withdrawals supported');
    }

    if (!amount || amount < 80) {
      throw new ApiError(400, 'Minimum withdrawal is €80.00');
    }

    if (!destination || typeof destination !== 'string' || destination.trim().length < 15) {
      throw new ApiError(400, 'Valid destination required');
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'User not found');

    const available = user.balances.get('EUR') || 0;
    if (available < amount) {
      throw new ApiError(400, `Insufficient balance (€${available.toFixed(2)})`);
    }

    // Deduct balance
    user.balances.set('EUR', available - amount);

    // Ledger entry
    user.ledger.push({
      amount: -amount,
      currency: 'EUR',
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal to ${destination.slice(0, 10)}...`,
      createdAt: new Date(),
    });

    user.markModified('balances');
    user.markModified('ledger');
    await user.save({ session });

    // Withdrawal record
    const [withdrawal] = await Withdrawal.create([{
      user: userId,
      amount,
      asset: 'EUR',
      address: destination.trim(),
      status: 'pending',
      netAmount: amount,
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted – pending review',
      withdrawalId: withdrawal._id,
      newBalance: user.balances.get('EUR'),
    });
  } catch (error) {
    await session.abortTransaction();
    next(error instanceof ApiError ? error : new ApiError(500, 'Withdrawal failed'));
  } finally {
    session.endSession();
  }
};

export const getMyTransactions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ledger');
    if (!user) throw new ApiError(404, 'User not found');

    res.json({
      success: true,
      ledger: [...user.ledger].sort((a, b) => b.createdAt - a.createdAt),
    });
  } catch (err) {
    next(err);
  }
};

export default { initiateWithdrawal, getMyTransactions };
