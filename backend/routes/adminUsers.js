// backend/routes/adminUsers.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin privileges
router.use(protect, admin);

/**
 * GET /api/admin/users
 * List all users (with optional search & pagination)
 */
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;

    const query = search.trim()
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin users list error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get full user profile + recent transactions
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Recent deposits & withdrawals (last 10 each)
    const deposits = await Transaction.find({ user: user._id, type: 'deposit' })
      .sort({ createdAt: -1 })
      .limit(10);

    const withdrawals = await Withdrawal.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user,
      recentDeposits: deposits,
      recentWithdrawals: withdrawals,
    });
  } catch (err) {
    console.error('Admin user details error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/users/:id/plan
 * Update user's investment plan
 */
router.patch('/:id/plan', async (req, res) => {
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ success: false, message: 'Plan is required' });
  }

  const validPlans = ['none', 'basic', 'premium', 'vip'];
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
    console.error('Update plan error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
});

/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban user
 */
router.patch('/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.banned = !user.banned;
    await user.save();

    res.json({
      success: true,
      message: user.banned ? 'User banned' : 'User unbanned',
      banned: user.banned,
    });
  } catch (err) {
    console.error('Ban/unban error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update ban status' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Permanently delete user
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User permanently deleted',
    });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password to a temporary value
 */
router.post('/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'; // random + secure chars
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(tempPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword: tempPassword, // show once only — send via secure channel in prod
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
