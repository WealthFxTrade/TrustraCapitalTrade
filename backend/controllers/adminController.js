// controllers/adminController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * Get global platform statistics for admin dashboard
 * @route   GET /api/admin/stats
 * @access  Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $facet: {
          totalLiquidity: [
            { $project: { balanceArray: { $objectToArray: '$balances' } } },
            { $unwind: '$balanceArray' },
            { $group: { _id: '$balanceArray.k', total: { $sum: { $ifNull: ['$balanceArray.v', 0] } } } },
          ],
          userStats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
              },
            },
          ],
        },
      },
    ]);

    const pendingKyc = await KYC.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers: stats[0]?.userStats[0]?.totalUsers || 0,
        activeUsers: stats[0]?.userStats[0]?.activeUsers || 0,
        pendingKyc,
        pendingWithdrawals,
        totalLiquidity: stats[0]?.totalLiquidity || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch dashboard statistics'));
  }
};

/**
 * Get all users (paginated, filtered)
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch users'));
  }
};

/**
 * Update user balance (admin only)
 * @route   PATCH /api/admin/users/:id/balance
 * @access  Admin
 */
export const updateBalance = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, type = 'credit', walletType = 'EUR' } = req.body;
    const userId = req.params.id;

    if (!amount || isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Valid positive amount required');
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'User not found');

    const current = user.balances.get(walletType) || 0;
    const updated = type === 'debit' ? current - Number(amount) : current + Number(amount);

    if (updated < 0) {
      throw new ApiError(400, 'Balance cannot go negative');
    }

    user.balances.set(walletType, updated);
    user.markModified('balances');

    // Log audit entry
    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'balance_update',
        target: userId,
        details: {
          walletType,
          type,
          amount: Number(amount),
          oldBalance: current,
          newBalance: updated,
        },
      }],
      { session }
    );

    await user.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Balance updated',
      newBalance: updated,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err instanceof ApiError ? err : new ApiError(500, 'Balance update failed'));
  } finally {
    session.endSession();
  }
};

/**
 * Update user profile fields (admin only)
 * @route   PATCH /api/admin/users/:id
 * @access  Admin
 */
export const updateUserEntity = async (req, res, next) => {
  try {
    const allowedUpdates = ['fullName', 'email', 'phone', 'role', 'isActive', 'banned'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));

    if (updates.length === 0) {
      throw new ApiError(400, 'No valid fields to update');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) throw new ApiError(404, 'User not found');

    // Log audit
    await AuditLog.create({
      admin: req.user._id,
      action: 'user_update',
      target: user._id,
      details: { updatedFields: updates },
    });

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(500, 'User update failed'));
  }
};

/**
 * Delete user and related data (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const deleteUserEntity = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.params.id;

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'User not found');

    // Delete related records
    await KYC.deleteMany({ user: userId }).session(session);
    await Withdrawal.deleteMany({ user: userId }).session(session);
    // Add other related models if needed (e.g., Deposits, Investments)

    await User.findByIdAndDelete(userId).session(session);

    // Audit log
    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'user_delete',
        target: userId,
        details: { email: user.email },
      }],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'User and related data deleted',
    });
  } catch (err) {
    await session.abortTransaction();
    next(err instanceof ApiError ? err : new ApiError(500, 'User deletion failed'));
  } finally {
    session.endSession();
  }
};

/**
 * Get audit logs (admin only)
 * @route   GET /api/admin/audit-logs
 * @access  Admin
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logs = await AuditLog.find()
      .populate('admin', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch audit logs'));
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  updateBalance,
  updateUserEntity,
  deleteUserEntity,
  getAuditLogs,
};
