import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Get current user's profile & balances
 * @route   GET /api/user/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User node not found');
  }
  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      balances: Object.fromEntries(user.balances || new Map())
    }
  });
});

/**
 * @desc    Get Personal Ledger (Transaction History)
 * @route   GET /api/user/ledger
 * @access  Private
 */
export const getLedger = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('ledger');
  if (!user) {
    res.status(404);
    throw new Error('Ledger data not accessible');
  }

  // Sort by newest first
  const sortedLedger = (user.ledger || []).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.status(200).json({ success: true, data: sortedLedger });
});

/**
 * @desc    Request Withdrawal (Lock funds & queue for Admin)
 * @route   POST /api/user/withdraw
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, currency, address, description } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Identity node not found');
  }

  const currentBalance = user.balances.get(currency) || 0;
  const withdrawAmount = Number(amount);

  if (withdrawAmount <= 0 || currentBalance < withdrawAmount) {
    res.status(400);
    throw new Error('Invalid amount or insufficient liquidity');
  }

  user.balances.set(currency, currentBalance - withdrawAmount);
  user.ledger.push({
    amount: -withdrawAmount,
    currency,
    type: 'withdrawal',
    status: 'pending',
    address: address || 'Internal Transfer',
    description: description || `Withdrawal request to ${address}`
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      message: 'Withdrawal request registered.'
    });
  }

  res.status(201).json({ success: true, balances: Object.fromEntries(user.balances) });
});

/**
 * @desc    Compound Yield (Move ROI -> INVESTED)
 * @route   POST /api/user/compound-yield
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Investor node not found');
  }

  const currentRoi = user.balances.get('ROI') || 0;
  const currentInvested = user.balances.get('INVESTED') || 0;

  if (currentRoi < 10) {
    res.status(400);
    throw new Error('Minimum €10.00 required for compounding');
  }

  user.balances.set('ROI', 0);
  user.balances.set('INVESTED', currentInvested + currentRoi);

  user.ledger.push({
    amount: currentRoi,
    currency: 'EUR',
    type: 'investment',
    status: 'completed',
    description: `PROTOCOL COMPOUND: €${currentRoi.toFixed(2)} re-invested`
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  res.status(200).json({ success: true, balances: Object.fromEntries(user.balances) });
});

/**
 * @desc    Update profile details
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { username, password } = req.body;
  if (username) user.username = username;
  if (password) user.password = password;

  await user.save();
  res.status(200).json({ success: true, message: 'Profile Updated' });
});

