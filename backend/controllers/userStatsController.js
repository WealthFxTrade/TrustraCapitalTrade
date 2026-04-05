import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import Investment from '../models/Investment.js';
import Withdrawal from '../models/Withdrawal.js';

/**
 * @desc Get user stats for dashboard
 * @route GET /api/user/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Aggregate deposits
  const deposits = await Transaction.aggregate([
    { $match: { user: userId, type: 'deposit', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Aggregate withdrawals
  const withdrawals = await Withdrawal.aggregate([
    { $match: { user: userId, status: { $in: ['completed', 'processing'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Aggregate active investments and ROI
  const investments = await Investment.aggregate([
    { $match: { user: userId, status: 'active' } },
    { $group: { _id: null, total: { $sum: '$amount' }, roi: { $sum: '$totalReturn' } } }
  ]);

  res.json({
    success: true,
    stats: {
      totalDeposits: deposits[0]?.total || 0,
      totalWithdrawals: withdrawals[0]?.total || 0,
      totalInvested: investments[0]?.total || 0,
      totalROI: investments[0]?.roi || 0,
    },
  });
});
