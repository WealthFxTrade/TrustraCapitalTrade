import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { runYieldDistribution } from '../utils/rioEngine.js';

/**
 * @desc    Get Dashboard Statistics
 */
export const getStats = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  const totalDeposits = users.reduce((acc, u) => acc + (u.balances?.EUR || 0), 0);
  
  res.status(200).json({
    success: true,
    totalUsers: users.length,
    totalDeposits,
    pendingWithdrawals: 0,
    activeNodes: users.filter(u => u.activePlan && u.activePlan !== 'none').length
  });
});

/**
 * @desc    Get System Infrastructure & Solvency Metrics
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  let totalAUM = 0;
  let totalRoiLiability = 0;

  users.forEach((user) => {
    const balances = user.balances || {};
    totalAUM += balances.EUR || 0;
    totalRoiLiability += balances.ROI || 0;
  });

  res.status(200).json({
    success: true,
    data: {
      dbLatency: 14,
      memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
      uptime: `${Math.floor(process.uptime() / 3600)}h`,
      activeUsers: users.length,
      totalAum: totalAUM,
      totalRoiPaid: totalRoiLiability,
    }
  });
});

/**
 * @desc    Get all users (Identity Registry)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: users.length, data: users });
});

/**
 * @desc    Update user balance manually
 */
export const updateUserBalance = asyncHandler(async (req, res) => {
  const { amount, balanceType = 'EUR', type = 'add' } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new Error('Investor node not found');

  const currentVal = user.balances.get(balanceType) || 0;
  const change = Number(amount);
  user.balances.set(balanceType, type === 'add' ? currentVal + change : currentVal - change);

  user.ledger.push({
    amount: type === 'add' ? change : -change,
    currency: balanceType.toUpperCase(),
    type: type === 'add' ? 'deposit' : 'withdrawal',
    status: 'completed',
    description: `ADMIN OVERRIDE: ${type.toUpperCase()}`,
  });

  await user.save();
  res.status(200).json({ success: true, balances: Object.fromEntries(user.balances) });
});

/**
 * @desc    Get Global Ledger Audit Trail (The function that was missing!)
 */
export const getGlobalLedger = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  const globalLedger = users.flatMap((user) =>
    (user.ledger || []).map((entry) => ({
      ...entry,
      username: user.username,
      email: user.email,
    }))
  ).sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)).slice(0, 200);

  res.status(200).json({ success: true, data: globalLedger });
});

/**
 * @desc    Get Withdrawal Queue
 */
export const getWithdrawals = asyncHandler(async (req, res) => {
  const users = await User.find({ "ledger.status": "pending", "ledger.type": "withdrawal" }).lean();
  const withdrawals = users.flatMap(user =>
    user.ledger
      .filter(entry => entry.status === 'pending' && entry.type === 'withdrawal')
      .map(entry => ({
        _id: entry._id,
        userId: user._id,
        userName: user.username,
        email: user.email,
        amount: entry.amount,
        status: entry.status,
        createdAt: entry.createdAt || entry.timestamp
      }))
  );
  res.status(200).json({ success: true, data: withdrawals });
});

/**
 * @desc    Process Withdrawal (Approve/Reject)
 */
export const processWithdrawal = asyncHandler(async (req, res) => {
  const { status, userId } = req.body;
  const user = await User.findById(userId);
  const entry = user.ledger.id(req.params.id);

  if (status === 'rejected') {
    const currentEur = user.balances.get('EUR') || 0;
    user.balances.set('EUR', currentEur + Math.abs(entry.amount));
  }
  entry.status = status;
  await user.save();
  res.status(200).json({ success: true, message: `Transaction ${status}` });
});

/**
 * @desc    Manual Trigger for RIO Engine
 */
export const triggerManualRoi = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const processedCount = await runYieldDistribution(io);
  res.status(200).json({ success: true, processed: processedCount });
});
