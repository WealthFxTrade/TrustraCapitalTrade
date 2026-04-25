// controllers/adminController.js

import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import { processWithdrawal } from '../utils/withdrawalEngine.js';

/**
 * =========================================
 * 📊 PLATFORM STATS
 * =========================================
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
  const users = await User.find({});

  const totalAUM = users.reduce((acc, user) => {
    const balances = user.balances || new Map();
    const eur = balances.get('EUR') || 0;
    const invested = balances.get('INVESTED') || 0;
    return acc + eur + invested;
  }, 0);

  const pendingTx = await Transaction.aggregate([
    { $match: { type: 'withdrawal', status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalAUM,
      totalUsers: users.length,
      pendingWithdrawals: pendingTx[0]?.total || 0,
      yieldRate: 1.5,
      health: 'Optimal'
    }
  });
});

/**
 * =========================================
 * 👥 USERS
 * =========================================
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({ success: true, data: users });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id, action } = req.params;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = action === 'activate';
  await user.save();

  res.json({ success: true, message: `User ${action}d` });
});

/**
 * =========================================
 * 💸 WITHDRAWALS (CORE ENGINE)
 * =========================================
 */
export const getWithdrawalRequests = asyncHandler(async (req, res) => {
  const withdrawals = await Transaction.find({ type: 'withdrawal' })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, withdrawals });
});

/**
 * ✅ APPROVE WITH AUTO BLOCKCHAIN SEND
 */
export const approveWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tx = await Transaction.findById(id).populate('user');
  if (!tx) throw new ApiError(404, 'Transaction not found');
  if (tx.status !== 'pending') throw new ApiError(400, 'Already processed');

  if (!tx.walletAddress) {
    throw new ApiError(400, 'Missing wallet address');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔥 EXECUTE BLOCKCHAIN TRANSFER
    const result = await processWithdrawal(tx._id);

    tx.status = 'completed';
    tx.txHash = result.txHash;

    await tx.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Withdrawal completed',
      txHash: result.txHash
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('[APPROVE ERROR]', err);

    throw new ApiError(500, err.message || 'Withdrawal failed');
  } finally {
    session.endSession();
  }
});

/**
 * ❌ REJECT WITH REFUND (MAP SAFE)
 */
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tx = await Transaction.findById(id);
  if (!tx) throw new ApiError(404, 'Transaction not found');
  if (tx.status !== 'pending') throw new ApiError(400, 'Already processed');

  const user = await User.findById(tx.user);
  if (!user) throw new ApiError(404, 'User not found');

  const currency = tx.currency || 'EUR';

  // ✅ FIX: Map-safe update
  const current = user.balances.get(currency) || 0;
  user.balances.set(currency, current + tx.amount);
  user.markModified('balances');

  tx.status = 'rejected';

  await user.save();
  await tx.save();

  res.json({
    success: true,
    message: 'Withdrawal rejected & refunded'
  });
});

/**
 * =========================================
 * ⚙️ YIELD ENGINE (REAL BASE)
 * =========================================
 */
export const triggerYieldDistribution = asyncHandler(async (req, res) => {
  const users = await User.find({});

  for (const user of users) {
    const invested = user.balances.get('INVESTED') || 0;
    if (invested <= 0) continue;

    const yieldRate = 0.015; // 1.5%
    const profit = invested * yieldRate;

    const currentProfit = user.balances.get('TOTAL_PROFIT') || 0;

    user.balances.set('TOTAL_PROFIT', currentProfit + profit);
    user.markModified('balances');

    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'yield',
      amount: profit,
      currency: 'EUR',
      status: 'completed',
      description: 'Automated yield distribution'
    });
  }

  res.json({
    success: true,
    message: 'Yield distributed successfully'
  });
});

/**
 * =========================================
 * 🪪 KYC SYSTEM
 * =========================================
 */
export const getPendingKYCs = asyncHandler(async (req, res) => {
  const users = await User.find({
    kycStatus: { $in: ['pending', 'submitted'] }
  }).select('-password');

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

export const updateKYCStatus = asyncHandler(async (req, res) => {
  const { userId, status, notes } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.kycStatus = status;
  user.kycNotes = notes || null;

  if (status === 'verified') {
    user.kycVerifiedAt = new Date();
  }

  await user.save();

  res.json({
    success: true,
    message: `KYC ${status}`
  });
});

/**
 * =========================================
 * 🎭 IMPERSONATION
 * =========================================
 */
export const impersonateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'User not found');

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    success: true,
    token,
    user
  });
});
