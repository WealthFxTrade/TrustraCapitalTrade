// backend/routes/adminOverview.js
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(protect, admin);

/**
 * GET /api/admin/overview/stats
 * Main dashboard stats (users, balances, pending actions)
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      bannedUsers,
      totalBalanceResult,
      pendingDeposits,
      pendingWithdrawals,
      totalProfitResult,
      recentActions,
    ] = await Promise.all([
      // User stats
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ banned: true }),

      // Balance overview
      User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' }, avg: { $avg: '$balance' } } }]),

      // Pending financial actions
      Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),

      // Profit stats
      Transaction.aggregate([
        { $match: { type: 'profit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Recent admin actions (last 5 from audit log if you have it)
      // Replace with your AuditLog model if you have one
      // AuditLog.find().sort({ createdAt: -1 }).limit(5).lean(),
      [], // placeholder — add your audit model here
    ]);

    const stats = {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        banned: bannedUsers,
      },
      balances: {
        total: totalBalanceResult[0]?.total || 0,
        average: totalBalanceResult[0]?.avg?.toFixed(2) || 0,
      },
      pending: {
        deposits: pendingDeposits,
        withdrawals: pendingWithdrawals,
      },
      profits: {
        totalPaid: totalProfitResult[0]?.total || 0,
      },
      recentActions,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error('Admin overview stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
});

/**
 * GET /api/admin/overview/top-users
 * Top 10 users by balance (useful for whale monitoring)
 */
router.get('/top-users', async (req, res) => {
  try {
    const topUsers = await User.find()
      .select('fullName email balance role plan createdAt')
      .sort({ balance: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      topUsers,
    });
  } catch (err) {
    console.error('Top users error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load top users' });
  }
});

/**
 * GET /api/admin/overview/recent-transactions
 * Recent 20 transactions across all users
 */
router.get('/recent-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      transactions,
    });
  } catch (err) {
    console.error('Recent transactions error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load recent transactions' });
  }
});

export default router;
