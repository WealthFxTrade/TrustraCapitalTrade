import mongoose from 'mongoose';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get Global Platform Metrics via Faceted Aggregation
 * @route   GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $facet: {
          totalLiquidity: [
            {
              $project: {
                balanceArray: {
                  $cond: [
                    { $isArray: { $objectToArray: "$balances" } },
                    { $objectToArray: "$balances" },
                    []
                  ]
                }
              }
            },
            { $unwind: "$balanceArray" },
            { $match: { "balanceArray.k": "EUR" } },
            {
              $group: {
                _id: null,
                total: { $sum: { $ifNull: ["$balanceArray.v", 0] } }
              }
            }
          ],
          userStats: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activePlans: { $sum: { $cond: ["$isPlanActive", 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    const pendingKyc = await KYC.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    const totalLiquidity = stats?.[0]?.totalLiquidity?.[0]?.total ?? 0;
    const totalUsers = stats?.[0]?.userStats?.[0]?.totalUsers ?? 0;
    const activePlans = stats?.[0]?.userStats?.[0]?.activePlans ?? 0;

    res.status(200).json({
      success: true,
      stats: {
        totalLiquidity,
        totalUsers,
        activePlans,
        pendingKyc,
        pendingWithdrawals,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Node aggregation failed" });
  }
};

/**
 * @desc    Atomic Balance Sync (Manual Credit/Debit)
 * @route   POST /api/admin/users/update-balance
 */
export const updateBalance = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId, amount, currency = 'EUR', type, description } = req.body;
    const numAmount = Number(amount);

    if (!userId) throw new Error('User ID required');
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount');
    if (!['credit', 'debit'].includes(type)) throw new Error('Invalid transaction type');

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');
    if (!user.balances) user.balances = new Map();

    const currentBalance = user.balances.get(currency) || 0;
    const newBalance = type === 'debit' ? currentBalance - numAmount : currentBalance + numAmount;
    if (newBalance < 0) throw new Error('Insufficient balance for debit');

    user.balances.set(currency, newBalance);

    user.ledger.push({
      amount: type === 'debit' ? -numAmount : numAmount,
      currency,
      type: type === 'debit' ? 'withdrawal' : 'deposit',
      status: 'completed',
      description: description || `Admin ${type}: ${numAmount} ${currency}`,
      createdAt: new Date()
    });

    await AuditLog.create([{
      admin: req.user?._id,
      action: type === 'debit' ? 'DEBIT_USER' : 'CREDIT_USER',
      targetId: user._id,
      targetModel: 'User',
      metadata: { amount: numAmount, currency, prevBalance: currentBalance, newBalance },
      ip: req.ip
    }], { session });

    user.markModified('balances');
    await user.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: 'Balance synchronized', newBalance });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Update User Entity (Role, Status, Info)
 * @route   PUT /api/admin/users/:id
 */
export const updateUserEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Security: Do not allow password updates via this route
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await AuditLog.create({
      admin: req.user?._id,
      action: 'UPDATE_USER_ENTITY',
      targetId: user._id,
      targetModel: 'User',
      metadata: { updatedFields: Object.keys(updateData) },
      ip: req.ip
    });

    res.json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete User Entity and associated data
 * @route   DELETE /api/admin/users/:id
 */
export const deleteUserEntity = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;

    const user = await User.findById(id).session(session);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await KYC.deleteMany({ user: id }).session(session);
    await User.findByIdAndDelete(id).session(session);

    await AuditLog.create([{
      admin: req.user?._id,
      action: 'DELETE_USER',
      targetId: id,
      targetModel: 'User',
      metadata: { email: user.email },
      ip: req.ip
    }], { session });

    await session.commitTransaction();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Fetch all users for admin management
 * @route   GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get Platform Audit Stream
 * @route   GET /api/admin/audit-logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Audit sync failed' });
  }
};

