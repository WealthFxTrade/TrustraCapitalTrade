import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { runYieldDistribution } from '../utils/rioEngine.js';

/**
 * @desc    Get all users (Identity Registry)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

/**
 * @desc    Update user balance manually (Ledger Override)
 * @route   PUT /api/admin/users/:id/balance
 * @access  Private/Admin
 */
export const updateUserBalance = asyncHandler(async (req, res) => {
  const { amount, balanceType, type } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Investor node not found');
  }

  const currentVal = user.balances.get(balanceType) || 0;
  const change = Number(amount);
  const newVal = type === 'add' ? currentVal + change : currentVal - change;

  // Update Map
  user.balances.set(balanceType, newVal);

  // Document in Immutable Ledger
  user.ledger.push({
    amount: type === 'add' ? change : -change,
    currency: 'EUR',
    type: 'deposit',
    status: 'completed',
    description: `ADMIN OVERRIDE: ${type.toUpperCase()} ${change} to ${balanceType} vault`
  });

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  // 🛰️ Real-time Socket Sync
  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances)
    });
  }

  res.json({
    success: true,
    message: 'Ledger Synchronized',
    balances: Object.fromEntries(user.balances)
  });
});

/**
 * @desc    Get all withdrawal requests
 * @route   GET /api/admin/withdrawals
 * @access  Private/Admin
 */
export const getWithdrawals = asyncHandler(async (req, res) => {
  const usersWithWithdrawals = await User.find({ 'ledger.type': 'withdrawal' });

  const withdrawals = usersWithWithdrawals.flatMap(user =>
    user.ledger
      .filter(entry => entry.type === 'withdrawal')
      .map(w => ({
        ...w.toObject(),
        userName: user.username,
        userId: user._id,
        email: user.email
      }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(withdrawals);
});

/**
 * @desc    Approve or Reject withdrawal with Auto-Refund
 * @route   PATCH /api/admin/withdrawal/:id
 * @access  Private/Admin
 */
export const updateWithdrawalStatus = asyncHandler(async (req, res) => {
  const { status, userId } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('Transaction record not found');
  }

  const transaction = user.ledger.id(req.params.id);

  // 🛡️ REFUND PROTOCOL
  // If rejected, move funds back from Hold to ROI vault
  if (status === 'rejected' && transaction.status === 'pending') {
    const currentRoi = user.balances.get('ROI') || 0;
    user.balances.set('ROI', currentRoi + transaction.amount);
    user.markModified('balances');
  }

  transaction.status = status;
  user.markModified('ledger');
  await user.save();

  // 🛰️ Real-time Socket Sync
  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances)
    });
  }

  res.json({
    success: true,
    message: `Transaction marked as ${status}`,
    balances: Object.fromEntries(user.balances)
  });
});

/**
 * @desc    Global Financial Audit & Solvency Metrics
 * @route   GET /api/admin/system-health
 * @access  Private/Admin
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const users = await User.find({});

  let totalAUM = 0;           // Total Assets (EUR)
  let totalRoiLiability = 0;  // Total Owed (ROI)
  let activeNodes = 0;        
  let dailyYieldOutflow = 0;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  users.forEach(user => {
    if (user.balances) {
      totalAUM += (user.balances.get('EUR') || 0);
      totalRoiLiability += (user.balances.get('ROI') || 0);
    }

    if (user.activePlan && user.activePlan !== 'none') activeNodes++;

    if (user.ledger) {
      const todayEntries = user.ledger.filter(entry =>
        entry.type === 'yield' && new Date(entry.createdAt) >= startOfToday
      );
      todayEntries.forEach(y => dailyYieldOutflow += y.amount);
    }
  });

  res.json({
    success: true,
    stats: {
      totalAUM,
      totalRoiLiability,
      activeNodes,
      totalInvestors: users.length,
      dailyYieldOutflow,
      solvencyRatio: totalRoiLiability > 0 ? (totalAUM / totalRoiLiability).toFixed(2) : '∞'
    }
  });
});

/**
 * @desc    Execute ROI Protocol Manually
 * @route   POST /api/admin/trigger-roi
 * @access  Private/Admin
 */
export const triggerManualRoi = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const processedCount = await runYieldDistribution(io);

  res.json({
    success: true,
    message: processedCount > 0 
      ? `ROI Protocol Executed: ${processedCount} nodes synchronized.` 
      : "No pending distributions for today."
  });
});

/**
 * @desc    Global Ledger Audit Trail
 * @route   GET /api/admin/ledger
 * @access  Private/Admin
 */
export const getGlobalLedger = asyncHandler(async (req, res) => {
  const users = await User.find({});
  
  const globalLedger = users.flatMap(user => 
    user.ledger.map(entry => ({
      ...entry.toObject(),
      username: user.username,
      userId: user._id,
      email: user.email
    }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(globalLedger.slice(0, 200));
});
