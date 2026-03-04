import mongoose from 'mongoose';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import Withdrawal from '../models/Withdrawal.js';
import Deposit from '../models/Deposit.js'; // Ensure this exists
import AuditLog from '../models/AuditLog.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Get global platform statistics for admin dashboard
 * @route   GET /api/admin/stats/overview
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

    // Fetch pending counts for the Sidebar Badges
    const [pendingKyc, pendingWithdrawals, pendingDeposits] = await Promise.all([
      KYC.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),
      Deposit.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: stats[0]?.userStats[0]?.totalUsers || 0,
        activeUsers: stats[0]?.userStats[0]?.activeUsers || 0,
        pendingKyc,
        pendingWithdrawals,
        pendingDeposits,
        totalLiquidity: stats[0]?.totalLiquidity || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch dashboard statistics'));
  }
};

/**
 * @desc    Get all users (paginated, filtered)
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
 * @desc    Update user balance with Transactional Audit Trail
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
      throw new ApiError(400, 'A valid positive numerical amount is required.');
    }

    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'Protocol Error: Targeted user node not found.');

    const currentBalance = user.balances.get(walletType) || 0;
    const updatedBalance = type === 'debit' 
      ? Number((currentBalance - Number(amount)).toFixed(2)) 
      : Number((currentBalance + Number(amount)).toFixed(2));

    if (updatedBalance < 0) {
      throw new ApiError(400, 'Operation denied: Balance cannot drop below zero.');
    }

    // Update the Map
    user.balances.set(walletType, updatedBalance);
    user.markModified('balances');

    // Create Immutable Audit Log
    await AuditLog.create(
      [{
        admin: req.user._id,
        action: 'balance_update',
        target: userId,
        details: {
          walletType,
          type,
          amount: Number(amount),
          oldBalance: currentBalance,
          newBalance: updatedBalance,
        },
      }],
      { session }
    );

    await user.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: `Balance for ${walletType} updated successfully.`,
      newBalance: updatedBalance,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err instanceof ApiError ? err : new ApiError(500, 'Transaction failed: Balance update aborted.'));
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Update user profile fields
 * @route   PATCH /api/admin/users/:id
 */
export const updateUserEntity = async (req, res, next) => {
  try {
    const allowedUpdates = ['fullName', 'email', 'phone', 'role', 'isActive', 'banned'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));

    if (updates.length === 0) throw new ApiError(400, 'No valid fields provided for update.');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) throw new ApiError(404, 'User not found.');

    await AuditLog.create({
      admin: req.user._id,
      action: 'user_update',
      target: user._id,
      details: { updatedFields: updates },
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(500, 'User update failed.'));
  }
};

/**
 * @desc    Nuclear Delete: Removes user and all associated financial/ID data
 * @route   DELETE /api/admin/users/:id
 */
export const deleteUserEntity = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.params.id;
    const user = await User.findById(userId).session(session);
    if (!user) throw new ApiError(404, 'User not found.');

    // Cascade Delete
    await Promise.all([
      KYC.deleteMany({ user: userId }).session(session),
      Withdrawal.deleteMany({ user: userId }).session(session),
      Deposit.deleteMany({ user: userId }).session(session),
      User.findByIdAndDelete(userId).session(session)
    ]);

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
    res.json({ success: true, message: 'User node and associated data purged.' });
  } catch (err) {
    await session.abortTransaction();
    next(err instanceof ApiError ? err : new ApiError(500, 'Purge failed.'));
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get Audit Trail for administrative actions
 * @route   GET /api/admin/audit-logs
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
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(new ApiError(500, 'Audit trail unreachable.'));
  }
};
