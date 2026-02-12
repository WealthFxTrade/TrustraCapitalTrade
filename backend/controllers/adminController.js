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
            { $project: { balanceArray: { $objectToArray: "$balances" } } },
            { $unwind: "$balanceArray" },
            {
              $group: {
                _id: "$balanceArray.k",
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

    const liquidityData = stats?.[0]?.totalLiquidity || [];
    const totalMainEUR = liquidityData.find(l => l._id === 'EUR')?.total || 0;
    const totalProfitEUR = liquidityData.find(l => l._id === 'EUR_PROFIT')?.total || 0;

    const totalUsers = stats?.[0]?.userStats?.[0]?.totalUsers ?? 0;
    const activePlans = stats?.[0]?.userStats?.[0]?.activePlans ?? 0;

    res.status(200).json({
      success: true,
      stats: {
        totalLiquidity: totalMainEUR,
        totalProfit: totalProfitEUR,
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
    const { userId, amount, currency = 'EUR', type, description, walletType = 'main' } = req.body;
    const numAmount = Number(amount);

    if (!userId) throw new Error('User ID required');
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount');

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const targetKey = walletType === 'profit' ? 'EUR_PROFIT' : currency;
    const currentBalance = user.balances.get(targetKey) || 0;

    const newBalance = type === 'debit' ? currentBalance - numAmount : currentBalance + numAmount;
    if (newBalance < 0) throw new Error('Insufficient balance for debit');

    user.balances.set(targetKey, newBalance);

    user.ledger.push({
      amount: type === 'debit' ? -numAmount : numAmount,
      currency: targetKey,
      type: type === 'debit' ? 'withdrawal' : 'deposit',
      status: 'completed',
      description: description || `Admin ${type}: ${numAmount} ${targetKey}`,
      createdAt: new Date()
    });

    await AuditLog.create([{
      admin: req.user?._id,
      action: type === 'debit' ? 'DEBIT_USER' : 'CREDIT_USER',
      targetId: user._id,
      targetModel: 'User',
      metadata: { amount: numAmount, wallet: targetKey, prevBalance: currentBalance, newBalance },
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
 * @desc    Fetch all users for admin management
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
 * @desc    Update User Entity (Role, Status, Info)
 */
export const updateUserEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData.password; // Security

    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User updated", user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete User Entity and associated data
 * ✅ THIS FIXES THE SYNTAX ERROR
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

    await session.commitTransaction();
    res.json({ success: true, message: "User purged from Trustra Node" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get Platform Audit Stream
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

