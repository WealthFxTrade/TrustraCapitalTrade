import mongoose from 'mongoose';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get Global Platform Metrics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await User.aggregate([{
      $facet: {
        totalLiquidity: [
          { $project: { balanceArray: { $objectToArray: "$balances" } } },
          { $unwind: "$balanceArray" },
          { $group: { _id: "$balanceArray.k", total: { $sum: { $ifNull: ["$balanceArray.v", 0] } } } }
        ],
        userStats: [
          { $group: { _id: null, totalUsers: { $sum: 1 }, activePlans: { $sum: { $cond: ["$isPlanActive", 1, 0] } } } }
        ]
      }
    }]);

    const pendingKyc = await KYC.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers: stats[0]?.userStats[0]?.totalUsers || 0,
        activePlans: stats[0]?.userStats[0]?.activePlans || 0,
        pendingKyc,
        pendingWithdrawals,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Aggregation failed" });
  }
};

/**
 * @desc    Fetch All Users
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
 * @desc    Update Balance (Atomic)
 */
export const updateBalance = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId, amount, type, walletType } = req.body;
    const user = await User.findById(userId).session(session);
    
    const targetKey = walletType === 'profit' ? 'EUR_PROFIT' : 'EUR';
    const current = user.balances.get(targetKey) || 0;
    const nextBal = type === 'debit' ? current - Number(amount) : current + Number(amount);
    
    user.balances.set(targetKey, nextBal);
    user.markModified('balances');
    await user.save({ session });
    await session.commitTransaction();
    res.json({ success: true, newBalance: nextBal });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Update User Entity
 */
export const updateUserEntity = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete User Entity (The Missing Export)
 */
export const deleteUserEntity = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await KYC.deleteMany({ user: req.params.id }).session(session);
    await User.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();
    res.json({ success: true, message: "User purged" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get Audit Logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('admin', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Audit sync failed" });
  }
}
