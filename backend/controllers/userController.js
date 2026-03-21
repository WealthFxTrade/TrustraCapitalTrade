// controllers/userController.js
// Business logic for user-related protected endpoints

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @route   GET /api/user/profile
 * @desc    Get current authenticated user's profile (excluding password)
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  console.log('[Profile Controller] Fetching profile for user ID:', req.user._id);

  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User profile not found in registry');
  }

  // Convert balances Map to plain object for clean JSON response
  const formattedUser = {
    ...user.toObject(),
    balances: Object.fromEntries(user.balances || new Map()),
  };

  console.log('[Profile Controller] Profile loaded successfully:', user.email);

  res.status(200).json({
    success: true,
    user: formattedUser,
  });
});

/**
 * @route   GET /api/user/ledger
 * @desc    Get user's personal transaction ledger (sorted newest first)
 * @access  Private
 */
export const getLedger = asyncHandler(async (req, res) => {
  console.log('[Ledger Controller] Fetching ledger for user ID:', req.user._id);

  const user = await User.findById(req.user._id).select('ledger');

  if (!user) {
    res.status(404);
    throw new Error('Ledger data not accessible');
  }

  // Sort ledger entries by newest first
  const sortedLedger = (user.ledger || []).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.status(200).json({
    success: true,
    data: sortedLedger,
  });
});

/**
 * @route   POST /api/user/withdraw
 * @desc    Submit a withdrawal request (deducts from balance, creates pending ledger entry)
 * @access  Private
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, currency = 'EUR', address, description } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User identity not found');
  }

  const withdrawAmount = Number(amount);
  const currentBalance = user.balances.get(currency) || 0;

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    res.status(400);
    throw new Error('Invalid withdrawal amount');
  }

  if (currentBalance < withdrawAmount) {
    res.status(400);
    throw new Error('Insufficient balance for withdrawal');
  }

  // Deduct from balance
  user.balances.set(currency, currentBalance - withdrawAmount);

  // Add pending withdrawal entry to ledger
  user.ledger.push({
    amount: -withdrawAmount,
    currency,
    type: 'withdrawal',
    status: 'pending',
    address: address || 'Internal Transfer',
    description: description || `Withdrawal request to ${address || 'internal'}`,
    createdAt: new Date(),
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  // Optional: real-time notification via socket
  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      message: 'Withdrawal request registered – awaiting admin approval',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Withdrawal request submitted successfully',
    balances: Object.fromEntries(user.balances),
  });
});

/**
 * @route   POST /api/user/compound-yield
 * @desc    Compound accrued ROI yield back into invested capital
 * @access  Private
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Investor profile not found');
  }

  const currentRoi = user.balances.get('ROI') || 0;
  const currentInvested = user.balances.get('INVESTED') || 0;

  if (currentRoi < 10) {
    res.status(400);
    throw new Error('Minimum €10.00 required for compounding');
  }

  // Move ROI → INVESTED
  user.balances.set('ROI', 0);
  user.balances.set('INVESTED', currentInvested + currentRoi);

  // Add compound entry to ledger
  user.ledger.push({
    amount: currentRoi,
    currency: 'EUR',
    type: 'compound',
    status: 'completed',
    description: `Yield compound: €${currentRoi.toFixed(2)} re-invested into capital`,
    createdAt: new Date(),
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Yield successfully compounded into capital',
    balances: Object.fromEntries(user.balances),
  });
});

/**
 * @route   PUT /api/user/profile/update
 * @desc    Update user's profile fields (username, fullName, etc.)
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  const { username, fullName, email } = req.body;

  if (username) user.username = username.trim();
  if (fullName) user.fullName = fullName.trim();
  if (email && email !== user.email) {
    // Optional: implement email verification flow here in future
    user.email = email.trim();
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      ...user.toObject(),
      balances: Object.fromEntries(user.balances || new Map()),
    },
  });
});
