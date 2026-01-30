// backend/routes/admin.js
import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes below require authentication AND admin role
router.use(protect, admin);

/**
 * GET /api/admin/users
 * List all users (with search & pagination)
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin users list error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/user/:id
 * Get full details of a single user (including recent transactions)
 */
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Recent transactions (last 10)
    const transactions = await Transaction.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      user,
      recentTransactions: transactions,
    });
  } catch (err) {
    console.error('Admin user details error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/user/:id/plan
 * Force update user's investment plan
 */
router.patch('/user/:id/plan', async (req, res) => {
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ success: false, message: 'Plan field is required' });
  }

  const validPlans = ['None', 'Rio Starter', 'Rio Basic', 'Rio Standard', 'Rio Advanced', 'Rio Elite'];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      message: `Invalid plan. Allowed: ${validPlans.join(', ')}`,
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      user,
    });
  } catch (err) {
    console.error('Update plan error:', err);
    res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
});

/**
 * PATCH /api/admin/user/:id/ban
 * Ban or unban a user
 */
router.patch('/user/:id/ban', async (req, res) => {
  const { isBanned } = req.body;

  if (typeof isBanned !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isBanned must be boolean' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user,
    });
  } catch (err) {
    console.error('Ban/unban error:', err);
    res.status(500).json({ success: false, message: 'Failed to update ban status' });
  }
});

/**
 * GET /api/admin/stats
 * Quick overview stats for admin dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      pendingDeposits,
      pendingWithdrawals,
      totalProfitPaid,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),
      Transaction.aggregate([
        { $match: { type: 'profit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        pendingDeposits,
        pendingWithdrawals,
        totalProfitPaid: totalProfitPaid[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

export default router;
