import User from '../models/User.js';
import KYC from '../models/KYC.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';

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
            { $match: { "balanceArray.k": "EUR" } },
            { $group: { _id: null, total: { $sum: "$balanceArray.v" } } }
          ],
          userStats: [
            { $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activePlans: { $sum: { $cond: ["$isPlanActive", 1, 0] } }
            }}
          ]
        }
      }
    ]);

    const kycCount = await KYC.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      stats: {
        totalLiquidity: stats[0].totalLiquidity[0]?.total || 0,
        totalUsers: stats[0].userStats[0]?.totalUsers || 0,
        activePlans: stats[0].userStats[0]?.activePlans || 0,
        pendingKyc: kycCount,
        pendingWithdrawals,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
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
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount');

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User Node not found');

    const currentBalance = user.balances.get(currency) || 0;
    const newBalance = type === 'debit' ? currentBalance - numAmount : currentBalance + numAmount;

    if (newBalance < 0) throw new Error('Insufficient node liquidity for debit');

    // Update Map
    user.balances.set(currency, newBalance);

    // Ledger Entry
    user.ledger.push({
      amount: type === 'debit' ? -numAmount : numAmount,
      currency,
      type: type === 'debit' ? 'withdrawal' : 'deposit',
      status: 'completed',
      description: description || `Admin ${type}: ${numAmount} ${currency}`,
      createdAt: new Date()
    });

    // Audit Log Entry
    await AuditLog.create([{
      admin: req.user._id,
      action: type === 'debit' ? 'DEBIT_USER' : 'CREDIT_USER',
      targetId: user._id,
      targetModel: 'User',
      metadata: { amount: numAmount, currency, prevBalance: currentBalance },
      ip: req.ip
    }], { session });

    user.markModified('balances');
    await user.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: 'Node balance synchronized', newBalance });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
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

