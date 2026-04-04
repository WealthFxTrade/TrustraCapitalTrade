import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import jwt from 'jsonwebtoken';

/**
 * @desc    Get Platform Stats (AUM, Users, Pending)
 * @route   GET /api/admin/health (and /api/admin/stats)
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
  const users = await User.find({});
  
  // Calculate Total AUM (EUR Balances + Active Principal)
  const totalAUM = users.reduce((acc, user) => {
    const bal = user.balances?.EUR || 0;
    const invested = user.investedAmount || 0;
    return acc + bal + invested;
  }, 0);

  // Aggregating Pending Withdrawals
  const pendingTx = await Transaction.aggregate([
    { $match: { type: 'withdrawal', status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalAUM,
      totalUsers: users.length,
      pendingWithdrawals: pendingTx[0]?.total || 0,
      yieldRate: 1.5, // Standard Platform Yield
      health: 'Optimal'
    }
  });
});

/**
 * @desc    Get all registered users
 * @route   GET /api/admin/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

/**
 * @desc    Update User Status (Ban/Activate)
 * @route   PATCH /api/admin/user/:id/:action
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id, action } = req.params;
  const user = await User.findById(id);

  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = action === 'activate';
  await user.save();

  res.status(200).json({ success: true, message: `Account ${action}d successfully` });
});

/**
 * @desc    Secure Impersonation (Generate token for specific user)
 * @route   POST /api/admin/impersonate/:userId
 */
export const impersonateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, 'User not found');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({
    success: true,
    message: `Impersonating ${user.name}`,
    token,
    user: { _id: user._id, name: user.name, role: user.role }
  });
});

// Placeholder exports for remaining logic
export const triggerYieldDistribution = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Yield protocols initiated" });
});
export const getPendingKYCs = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});
export const updateKYCStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "KYC updated" });
});

