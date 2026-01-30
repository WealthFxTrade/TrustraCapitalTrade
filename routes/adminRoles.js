// backend/routes/adminRoles.js
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(protect, admin);

/**
 * GET /api/admin/roles/users
 * List all users with their roles (search + pagination)
 */
router.get('/users', async (req, res) => {
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
      .select('fullName email role banned isVerified createdAt')
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
    console.error('Admin list users with roles error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/roles/users/:id
 * Get single user role info + basic profile
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('fullName email role banned isVerified createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Admin get user role error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/roles/users/:id
 * Assign or change user role (user ↔ admin)
 */
router.patch('/users/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role. Allowed: user, admin');
    }

    const user = await User.findById(req.params.id).session(session);
    if (!user) throw new Error('User not found');

    if (user.role === role) {
      throw new Error(`User already has role: ${role}`);
    }

    const oldRole = user.role;
    user.role = role;
    await user.save({ session });

    await AuditLog.create(
      [{
        admin: req.user._id,
        action: role === 'admin' ? 'GRANT_ADMIN_ROLE' : 'REVOKE_ADMIN_ROLE',
        targetId: user._id,
        targetModel: 'User',
        metadata: { oldRole, newRole: role, email: user.email },
        ip: req.ip,
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Role updated to ${role}`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('Role assignment error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
