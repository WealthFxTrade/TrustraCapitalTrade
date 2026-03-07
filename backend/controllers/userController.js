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
 * @desc    Update profile details
 * @route   PUT /api/user/profile/update
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

/**
 * @desc    Get Personal Ledger (Transaction History)
 * @route   GET /api/user/ledger
 */
export const getLedger = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('ledger');

  if (!user) {
    res.status(404);
    throw new Error('Ledger data not accessible');
  }

  // Sort by newest first
  const sortedLedger = (user.ledger || []).sort((a, b) => 
    new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
  );

  res.status(200).json({
    success: true,
    data: sortedLedger
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
  
  // Update profit tracker
  user.totalProfit = (user.totalProfit || 0) + currentRoi;

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

  // Socket Update for real-time dashboard refresh
  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances),
      totalProfit: user.totalProfit
    });
  }

  res.status(200).json({
    success: true,
    balances: Object.fromEntries(user.balances)
  });
});
