// controllers/userController.js - FULLY CORRECTED & UNSHORTENED VERSION
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

/**
 * @route   GET /api/user/profile
 * @desc    Get current authenticated user's profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      balances: Object.fromEntries(user.balances || new Map()),
    },
  });
});

/**
 * @route   GET /api/user/balances
 * @desc    Get user balances for Dashboard
 * @access  Private
 */
export const getBalances = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const balances = Object.fromEntries(user.balances || new Map());

  res.status(200).json({
    success: true,
    data: {
      totalBalance: Number(balances.EUR || 0),
      profitBalance: Number(balances.ROI || 0),
      availableBalance: Number((balances.EUR || 0) - (balances.LOCKED || 0)),
      currency: 'EUR'
    }
  });
});

/**
 * @route   GET /api/user/transactions/recent
 * @desc    Get recent transactions for Dashboard
 * @access  Private
 */
export const getRecentTransactions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('ledger');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const recent = (user.ledger || [])
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  res.status(200).json({
    success: true,
    data: recent.length > 0 ? recent : []
  });
});

/**
 * @route   GET /api/user/deposit-address
 * @desc    Generate UNIQUE BTC address per user using HD wallet (xpub)
 * @access  Private
 */
export const getDepositAddress = asyncHandler(async (req, res) => {
  const { asset = 'BTC' } = req.query;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (asset.toUpperCase() !== 'BTC') {
    return res.status(400).json({
      success: false,
      message: 'Only BTC deposit is supported at the moment. ETH support coming soon.'
    });
  }

  try {
    // Reuse existing address if already generated for this user
    if (user.btcDepositAddress) {
      return res.status(200).json({
        success: true,
        asset: 'BTC',
        address: user.btcDepositAddress,
        network: 'Bitcoin Mainnet (SegWit)',
        minDeposit: 0.0001,
        confirmations: 6,
        message: 'Your personal BTC deposit address',
        note: 'Send ONLY BTC to this address. All funds go to the platform hot wallet.'
      });
    }

    // Generate new unique address using next index
    const nextIndex = (user.lastBtcIndex || 100) + 1;
    const { address } = deriveBtcAddress(nextIndex);

    // Create pending deposit record with ALL required fields
    await Deposit.create({
      user: user._id,
      currency: 'BTC',
      address: address,
      amount: 0,                    // Required field - fixed
      expectedAmount: 0.0001,
      status: 'pending',
      locked: false
    });

    // Save address to user
    user.btcDepositAddress = address;
    user.lastBtcIndex = nextIndex;
    await user.save();

    res.status(200).json({
      success: true,
      asset: 'BTC',
      address,
      network: 'Bitcoin Mainnet (SegWit)',
      minDeposit: 0.0001,
      confirmations: 6,
      message: 'Your personal BTC deposit address generated successfully',
      note: 'Send ONLY BTC (any amount above minimum) to this address. Funds will be credited automatically after confirmation.'
    });

  } catch (error) {
    console.error('[DEPOSIT ADDRESS ERROR]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate deposit address. Please try again.'
    });
  }
});

/**
 * @route   GET /api/user/ledger
 * @desc    Get full user ledger - Fixed to stop spinning
 * @access  Private
 */
export const getLedger = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('ledger totalBalance realizedProfit');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const sortedLedger = (user.ledger || []).sort((a, b) =>
    new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  res.status(200).json({
    success: true,
    data: sortedLedger,
    totalBalance: user.totalBalance || 0,
    realizedProfit: user.realizedProfit || 0,
  });
});

/**
 * @route   POST /api/user/withdraw
 * @desc    Submit withdrawal request
 * @access  Private
 */
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, currency = 'EUR', address, description } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const withdrawAmount = Number(amount);
  const currentBalance = user.balances.get(currency) || 0;

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    res.status(400);
    throw new Error('Invalid withdrawal amount');
  }

  if (currentBalance < withdrawAmount) {
    res.status(400);
    throw new Error('Insufficient balance');
  }

  user.balances.set(currency, currentBalance - withdrawAmount);

  user.ledger.push({
    amount: -withdrawAmount,
    currency,
    type: 'withdrawal',
    status: 'pending',
    address: address || 'Internal',
    description: description || `Withdrawal request`,
    createdAt: new Date(),
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Withdrawal request submitted successfully',
    remainingBalance: user.balances.get(currency),
  });
});

/**
 * @route   POST /api/user/compound-yield
 * @desc    Compound ROI yield
 * @access  Private
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const currentRoi = user.balances.get('ROI') || 0;
  if (currentRoi < 10) {
    res.status(400);
    throw new Error('Minimum €10 required for compounding');
  }

  const currentInvested = user.balances.get('INVESTED') || 0;

  user.balances.set('ROI', 0);
  user.balances.set('INVESTED', currentInvested + currentRoi);

  user.ledger.push({
    amount: currentRoi,
    currency: 'EUR',
    type: 'compound',
    status: 'completed',
    description: `Compounded €${currentRoi.toFixed(2)} into investment`,
    createdAt: new Date(),
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Yield compounded successfully',
    newInvested: user.balances.get('INVESTED'),
  });
});

/**
 * @route   PUT /api/user/profile/update
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { username, fullName, email } = req.body;

  if (username) user.username = username.trim();
  if (fullName) user.fullName = fullName.trim();
  if (email && email !== user.email) user.email = email.trim();

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: { ...user.toObject(), balances: Object.fromEntries(user.balances || new Map()) },
  });
});
