import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import mongoose from 'mongoose';

/**
 * User requests withdrawal
 */
export const requestWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { asset, amount, address } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
    if (!address) throw new ApiError(400, "Wallet address is required");
    if (!asset) throw new ApiError(400, "Asset type is required");

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, "User not found");

    // Check balance
    const currentBalance = user.balances.get(asset) || 0;
    if (currentBalance < amount) {
      throw new ApiError(400, `Insufficient ${asset} balance`);
    }

    // Deduct funds (lock)
    user.balances.set(asset, currentBalance - amount);
    user.markModified('balances');

    // Create withdrawal
    const [withdrawal] = await Withdrawal.create([{
      user: userId,
      asset,
      amount,
      address,
      status: 'pending'
    }], { session });

    // Ledger entry
    user.ledger.push({
      amount,
      currency: asset,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to ${address}`,
      referenceId: withdrawal._id
    });
    user.markModified('ledger');
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({ success: true, message: "Withdrawal requested", withdrawal });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * Admin approves withdrawal
 */
export const approveWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");
    if (withdrawal.status !== 'pending') throw new ApiError(400, "Already processed");

    withdrawal.status = 'completed';
    withdrawal.processedAt = new Date();
    await withdrawal.save({ session });

    // Update ledger
    const user = await User.findById(withdrawal.user).session(session);
    const ledgerItem = user.ledger.find(l => l.referenceId.toString() === withdrawal._id.toString());
    if (ledgerItem) {
      ledgerItem.status = 'completed';
      user.markModified('ledger');
      await user.save({ session });
    }

    await session.commitTransaction();
    res.json({ success: true, message: "Withdrawal approved", withdrawal });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * Admin rejects withdrawal
 */
export const rejectWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new ApiError(404, "Withdrawal not found");
    if (withdrawal.status !== 'pending') throw new ApiError(400, "Already processed");

    // Refund user
    const user = await User.findById(withdrawal.user).session(session);
    const currentBalance = user.balances.get(withdrawal.asset) || 0;
    user.balances.set(withdrawal.asset, currentBalance + withdrawal.amount);

    // Update ledger
    const ledgerItem = user.ledger.find(l => l.referenceId.toString() === withdrawal._id.toString());
    if (ledgerItem) {
      ledgerItem.status = 'rejected';
      user.markModified('ledger');
    }

    await user.save({ session });

    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date();
    await withdrawal.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: "Withdrawal rejected and funds returned", withdrawal });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/**
 * User withdrawal history
 */
export const getUserWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: all withdrawals
 */
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: withdrawals.length, withdrawals });
  } catch (err) {
    next(err);
  }
};
