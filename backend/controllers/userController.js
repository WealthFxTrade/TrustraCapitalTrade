import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Get user profile node
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      balances: Object.fromEntries(user.balances),
      activePlan: user.activePlan,
      kycStatus: user.kycStatus
    });
  } else {
    res.status(404);
    throw new Error('User node not found');
  }
});

/**
 * @desc    Update user profile (Identity Shift)
 * @route   PUT /api/users/profile/update
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      // Pass token back if session needs refresh
    });
  } else {
    res.status(404);
    throw new Error('Identity update failed: Node not found');
  }
});

/**
 * @desc    Get personal transaction ledger
 * @route   GET /api/users/ledger
 * @access  Private
 */
export const getLedger = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Ledger access denied: Node not found');
  }

  // Returns the user's specific history sorted by latest activity
  const sortedLedger = user.ledger.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json(sortedLedger);
});
