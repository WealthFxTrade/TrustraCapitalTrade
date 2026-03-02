import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Request & Execute a withdrawal with OTP Verification
 */
export const requestWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { amount, currency = 'EUR', address, otp } = req.body;

    if (!amount || amount <= 0) throw new Error('Invalid withdrawal amount');
    if (!otp) throw new Error('Security Cipher (OTP) required');

    const user = await User.findById(req.user.id).select('+otpCode +otpExpires').session(session);
    if (!user) throw new Error('User Node not found');

    if (!user.otpCode || user.otpCode !== otp) throw new Error('Invalid Security Cipher (OTP)');
    if (Date.now() > user.otpExpires) throw new Error('Security Cipher Expired');

    const currentProfit = user.balances.get('ROI') || 0;
    if (currentProfit < amount) throw new Error('Insufficient Yield Allocation');

    const [transaction] = await Transaction.create([{
      user: user._id,
      type: 'withdrawal',
      amount,
      signedAmount: -amount,
      currency,
      walletAddress: address,
      status: 'pending',
      description: `Extraction to ${address}`,
      method: 'crypto'
    }], { session });

    const newBalance = Number((currentProfit - amount).toFixed(2));
    user.balances.set('ROI', newBalance);
    user.otpCode = null;
    user.otpExpires = null;
    user.totalBalance = (user.totalBalance || 0) - amount;

    await user.save({ session, validateBeforeSave: false });
    await session.commitTransaction();

    res.status(201).json({ success: true, message: 'Extraction protocol initiated', newBalance });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Fetch global activity logs for Admin Pulse
 */
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await Transaction.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(15);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: "Activity Feed Offline" });
  }
};

/**
 * @desc    Get user withdrawal history
 */
export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ user: req.user.id, type: 'withdrawal' }).sort({ createdAt: -1 });
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update status (Admin) - Refunds user if rejected
 */
export const updateWithdrawalStatus = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id).session(session);

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'pending') throw new Error('Transaction already processed');

    transaction.status = status;
    await transaction.save({ session });

    if (status === 'rejected' || status === 'failed') {
      const user = await User.findById(transaction.user).session(session);
      const current = user.balances.get('ROI') || 0;
      user.balances.set('ROI', current + transaction.amount);
      user.totalBalance += transaction.amount;
      await user.save({ session, validateBeforeSave: false });
    }

    await session.commitTransaction();
    res.json({ success: true, message: `Node Status Updated: ${status}` });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get all withdrawals (Admin Only) - MISSING EXPORT ADDED
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

