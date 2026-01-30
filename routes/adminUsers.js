// backend/routes/adminUsers.js
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // for secure temp password generation

import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected + admin-only
router.use(protect, admin);

/**
 * GET /api/admin/users
 * List users with search & pagination
 */
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

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
      .skip(skip)
      .limit(Number(limit))
      .lean();

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
    console.error('Admin list users error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * User profile + recent activity
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [deposits, withdrawals] = await Promise.all([
      Transaction.find({ user: user._id, type: 'deposit' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Withdrawal.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

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
 * Update user plan (atomic + audited)
 */
router.patch('/:id/plan', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { plan } = req.body;
    const validPlans = ['none', 'basic', 'premium', 'vip'];

    if (!validPlans.includes(plan)) {
      throw new Error(`Invalid plan. Allowed: ${validPlans.join(', ')}`);
    }

    const user = await User.findById(req.params.id).session(session);
    if (!user) throw new Error('User not found');

    const oldPlan = user.plan;
    user.plan = plan;
    await user.save({ session });

    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'UPDATE_USER_PLAN',
        targetId: user._id,
        targetModel: 'User',
        metadata: { oldPlan, newPlan: plan },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({ success: true, message: 'Plan updated successfully', user });
  } catch (err) {
    await session.abortTransaction();
    console.error('Update plan error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * PATCH /api/admin/users/:id/ban
 * Toggle ban status (atomic + audited)
 */
router.patch('/:id/ban', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params.id).session(session);
    if (!user) throw new Error('User not found');

    user.banned = !user.banned;
    await user.save({ session });

    await AuditLog.create(
      [{
        admin: req.user._id,
        action: user.banned ? 'BAN_USER' : 'UNBAN_USER',
        targetId: user._id,
        targetModel: 'User',
        metadata: { banned: user.banned },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: user.banned ? 'User banned' : 'User unbanned',
      banned: user.banned,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Ban/unban error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * DELETE /api/admin/users/:id
 * Permanent delete (atomic + audited)
 */
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params.id).session(session);
    if (!user) throw new Error('User not found');

    await User.deleteOne({ _id: req.params.id }, { session });

    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'DELETE_USER',
        targetId: user._id,
        targetModel: 'User',
        metadata: { email: user.email },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({ success: true, message: 'User permanently deleted' });
  } catch (err) {
    await session.abortTransaction();
    console.error('Delete user error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Reset password to temporary value (audited)
 */
router.post('/:id/reset-password', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params.id).session(session);
    if (!user) throw new Error('User not found');

    const tempPassword = crypto.randomBytes(8).toString('hex') + 'A1!';
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(tempPassword, salt);
    await user.save({ session });

    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'RESET_USER_PASSWORD',
        targetId: user._id,
        targetModel: 'User',
        metadata: { note: 'Admin-initiated password reset' },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword: tempPassword,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Reset password error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
