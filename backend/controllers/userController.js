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

  // 1. Validation
  if (withdrawAmount <= 0) {
    res.status(400);
    throw new Error('Invalid withdrawal amount');
  }

  if (currentBalance < withdrawAmount) {
    res.status(400);
    throw new Error(`Insufficient ${currency} liquidity for this operation`);
  }

  // 2. Atomic Deduction (Move from available to pending status)
  user.balances.set(currency, currentBalance - withdrawAmount);

  // 3. Document in Ledger (Pending State)
  user.ledger.push({
    amount: withdrawAmount,
    currency,
    type: 'withdrawal',
    status: 'pending',
    address: address || 'Internal Transfer',
    description: description || `Withdrawal request to ${address}`,
    createdAt: new Date()
  });

  // 4. Persistence Handshake
  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  // 5. Emit Real-time update (To refresh user's visible balance immediately)
  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      message: 'Withdrawal request registered and funds locked.'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Withdrawal request queued for Zurich Treasury approval',
    balances: Object.fromEntries(user.balances)
  });
});

/**
 * @desc    Compound Yield (Move ROI -> EUR Principal)
 * @route   POST /api/user/compound-yield
 */
export const compoundYield = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Investor node not found');
  }

  const currentRoi = user.balances.get('ROI') || 0;
  const currentEur = user.balances.get('EUR') || 0;

  if (currentRoi < 10) {
    res.status(400);
    throw new Error('Minimum €10.00 required for re-injection');
  }

  // Atomic Transfer within Mongoose Map
  user.balances.set('ROI', 0);
  user.balances.set('EUR', currentEur + currentRoi);

  // Update total balance metadata
  user.totalBalance = user.balances.get('EUR') + (user.balances.get('ROI') || 0);

  // Record in Ledger
  user.ledger.push({
    amount: currentRoi,
    currency: 'EUR',
    type: 'yield',
    status: 'completed',
    description: `PROTOCOL COMPOUND: €${currentRoi.toFixed(2)} injected into Principal`,
    createdAt: new Date()
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      totalBalance: user.totalBalance
    });
  }

  res.status(200).json({
    success: true,
    balances: Object.fromEntries(user.balances)
  });
});

/**
 * @desc    Get Personal Ledger (Transaction History)
 */
export const getLedger = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('ledger');
  if (!user) {
    res.status(404);
    throw new Error('Ledger data not accessible');
  }

  const sortedLedger = (user.ledger || []).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.status(200).json({ success: true, data: sortedLedger });
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
  if (username && username !== user.username) {
    const existing = await User.findOne({ username });
    if (existing) {
      res.status(400);
      throw new Error('Username already synchronized to another node');
    }
    user.username = username;
  }

  if (password) user.password = password;

  await user.save();
  res.status(200).json({ success: true, message: 'Profile Updated' });
});
