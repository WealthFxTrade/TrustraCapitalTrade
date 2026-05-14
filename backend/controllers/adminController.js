// controllers/adminController.js

import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';
import { processWithdrawal } from '../utils/withdrawalEngine.js';

/**
 * ============================================================================
 * 📊 PLATFORM STATS
 * ============================================================================
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
  const users = await User.find({});

  // PRODUCTION FIX: Corrected Map .get() abstractions to standard sub-object dot properties
  const totalAUM = users.reduce((acc, user) => {
    const b = user.balances;
    const eur = b?.EUR || 0;
    const invested = b?.INVESTED || 0;
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
 * ============================================================================
 * 👥 USERS
 * ============================================================================
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

  res.json({ success: true, message: `User ${action}d successfully` });
});

/**
 * ============================================================================
 * 💸 WITHDRAWALS (CORE ENGINE INTEGRATION)
 * ============================================================================
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
  
  const tx = await Transaction.findById(id);
  if (!tx) throw new ApiError(404, 'Transaction trace instance absent.');
  if (tx.status !== 'pending') throw new ApiError(400, 'This transaction voucher has already been processed.');

  try {
    // PRODUCTION FIX: Hand over single-thread state tracking to your verified withdrawal engine.
    // This correctly handles internally structured locks, double-entry ledgers, and fallbacks.
    const io = req.app.get('io');
    const completedTx = await processWithdrawal(tx._id, io);                                             

    res.json({                                                                                        
      success: true,
      message: 'Withdrawal completed and broadcast on-chain successfully.',
      txHash: completedTx.txHash
    });

  } catch (err) {
    console.error('[APPROVE ERROR TRANSACTION TRACKER]', err);                                                      
    throw new ApiError(500, err.message || 'On-chain payout processing execution rejected.');
  }
});

/**
 * ❌ REJECT WITH REFUND (PLAIN OBJECT SIGNATURE SAFETY)
 */
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tx = await Transaction.findById(id);
  if (!tx) throw new ApiError(404, 'Transaction voucher record not found.');
  if (tx.status !== 'pending') throw new ApiError(400, 'This target entry has already been evaluated.');                    
  
  const user = await User.findById(tx.user);
  if (!user) throw new ApiError(404, 'Associated profile record absent.');

  const currency = (tx.currency || 'EUR').toUpperCase();                                                        
  const lockedKey = `LOCKED_${currency}`;
  const availableKey = currency;

  // PRODUCTION FIX: Wiped broken .get() / .set() sub-object syntax mutations
  if (user.balances[lockedKey] === undefined || user.balances[availableKey] === undefined) {
    throw new ApiError(400, `Target currency allocation sub-wallet [${currency}] is invalid.`);
  }

  // Deduct from holding states and restore available spending reserves cleanly
  user.balances[lockedKey] = Number((user.balances[lockedKey] - tx.amount).toFixed(8));
  user.balances[availableKey] = Number((user.balances[availableKey] + tx.amount).toFixed(8));

  if (user.balances[lockedKey] < 0) {
    user.balances[lockedKey] = 0;
  }

  user.markModified('balances');
  tx.status = 'rejected';

  await user.save();
  await tx.save();

  // Push real-time balanced tracking updates down the socket pipe to update front-end views
  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: {
        EUR: user.balances.EUR,
        BTC: user.balances.BTC,
        ETH: user.balances.ETH,
        TOTAL_PROFIT: user.balances.TOTAL_PROFIT,
        INVESTED: user.balances.INVESTED
      },
      message: `❌ Your withdrawal request for ${tx.amount} ${currency} was rejected. Funds restored.`
    });
  }

  res.json({                                                                                        
    success: true,
    message: 'Withdrawal operation rejected. Capital reserves restored to user balances.'
  });
});

/**
 * ============================================================================
 * ⚙️ YIELD ENGINE (MANUAL OVERRIDE PIPELINE)
 * ============================================================================
 */
export const triggerYieldDistribution = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true, isBanned: false, activePlan: { $ne: 'None' } });
  
  // Aligned plan rates context dictionary
  const RATES = {
    'Tier I: Entry': 0.002,
    'Tier II: Core': 0.0035,
    'Tier III: Prime': 0.0045,
    'Tier IV: Institutional': 0.006,
    'Tier V: Sovereign': 0.008
  };

  let processedCount = 0;

  for (const user of users) {
    // PRODUCTION FIX: Converted out Map methods to use standard properties
    const invested = user.balances?.INVESTED || 0;
    if (invested <= 0) continue;

    const rate = RATES[user.activePlan] || 0.001; 
    const profit = Number((invested * rate).toFixed(2));
    if (profit <= 0) continue;

    user.balances.EUR = Number((user.balances.EUR + profit).toFixed(2));
    user.balances.TOTAL_PROFIT = Number((user.balances.TOTAL_PROFIT + profit).toFixed(2));
    user.markModified('balances');

    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'yield',
      amount: profit,
      currency: 'EUR',
      status: 'completed',
      description: `Manual Admin Distribution: ${user.activePlan}`
    });

    processedCount++;
  }

  res.json({
    success: true,
    message: `Manual yield run complete. Successfully processed ${processedCount} active investor nodes.`
  });
});

/**
 * ============================================================================
 * 🪪 KYC SYSTEM
 * ============================================================================
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
  if (!user) throw new ApiError(404, 'User document signature not found.');

  user.kycStatus = status;
  user.kycNotes = notes || null;

  if (status === 'verified') {
    user.kycVerifiedAt = new Date();
  }

  await user.save();

  res.json({
    success: true,
    message: `User security verification status shifted to ${status}`
  });
});

/**
 * ============================================================================
 * 🎭 IMPERSONATION SECURITY GATE
 * ============================================================================
 */
export const impersonateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'User document signature not found.');

  // Create an identity masquerade tracking token payload with short lifespan bounds
  const token = jwt.sign(
    { id: user._id, isImpersonated: true },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

