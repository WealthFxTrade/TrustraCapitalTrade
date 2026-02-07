import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import mongoose from 'mongoose';

export const requestWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { asset, amount, address } = req.body;
    const userId = req.user.id;

    if (amount <= 0) throw new ApiError(400, "Invalid amount");

    const user = await User.findById(userId).session(session);
    
    // Check if user has enough balance
    const currentBalance = user.balances.get(asset) || 0;
    if (currentBalance < amount) {
      throw new ApiError(400, `Insufficient ${asset} balance`);
    }

    // 1. Deduct balance immediately (lock funds)
    user.balances.set(asset, currentBalance - amount);
    await user.save({ session });

    // 2. Create withdrawal record
    const withdrawal = await Withdrawal.create([{
      user: userId,
      asset,
      amount,
      address,
      status: 'pending'
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, message: "Withdrawal requested", withdrawal: withdrawal[0] });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

