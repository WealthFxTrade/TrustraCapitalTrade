/**
 * controllers/adminController.js - Zurich Mainnet Root Authority
 * Handles User Management, Solvency, Ledger Auditing, Yield Distribution, and KYC.
 */

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { runYieldDistribution } from '../utils/rioEngine.js';

/**
 * @desc    Get Dashboard Statistics (High-level Overview)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getStats = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();

  // Aggregate total deposits from Map balances across all users
  const totalDeposits = users.reduce((acc, u) => {
    const balances = u.balances instanceof Map 
      ? Object.fromEntries(u.balances) 
      : (u.balances || {});
    return acc + (balances.EUR || 0);
  }, 0);

  // Count all pending withdrawal entries in all user ledgers
  const pendingWithdrawals = users.reduce((acc, u) => {
    const pending = u.ledger?.filter(
      (l) => l.type === 'withdrawal' && l.status === 'pending'
    ).length || 0;
    return acc + pending;
  }, 0);

  res.status(200).json({
    success: true,
    totalUsers: users.length,
    totalDeposits,
    pendingWithdrawals,
    activeNodes: users.filter((u) => u.activePlan && u.activePlan !== 'none').length
  });
});

/**
 * @desc    Get System Infrastructure & Solvency Metrics
 * @route   GET /api/admin/health
 * @access  Private/Admin
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  let totalAUM = 0;
  let totalRoiLiability = 0;

  users.forEach((user) => {
    const balances = user.balances instanceof Map 
      ? Object.fromEntries(user.balances) 
      : (user.balances || {});
    totalAUM += balances.EUR || 0;
    totalRoiLiability += balances.ROI || 0;
  });

  res.status(200).json({
    success: true,
    dbStatus: 'connected',
    dbLatency: 14, // Simulated latency
    memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
    uptime: `${Math.floor(process.uptime() / 3600)}h`,
    env: process.env.NODE_ENV || 'production',
    activeUsers: users.length,
    totalAum: totalAUM,
    totalRoiPaid: totalRoiLiability,
  });
});

/**
 * @desc    Get all users (Identity Registry)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  const transformedUsers = users.map(u => ({
    ...u,
    balances: u.balances instanceof Map ? Object.fromEntries(u.balances) : u.balances
  }));

  res.status(200).json({
    success: true,
    count: transformedUsers.length,
    data: transformedUsers
  });
});

/**
 * @desc    Update user balance manually (Admin Override)
 * @route   PUT /api/admin/users/:id/balance
 * @access  Private/Admin
 */
export const updateUserBalance = asyncHandler(async (req, res) => {
  const { amount, balanceType = 'EUR', type = 'add' } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Investor node not found in Registry');
  }

  const currentVal = user.balances.get(balanceType) || 0;
  const change = Number(amount);
  const newVal = type === 'add' ? currentVal + change : currentVal - change;

  user.balances.set(balanceType, newVal);

  user.ledger.push({
    amount: type === 'add' ? change : -change,
    currency: balanceType.toUpperCase(),
    type: 'override',
    status: 'completed',
    description: `ADMIN OVERRIDE: ${type.toUpperCase()} by root authority`,
    createdAt: new Date()
  });

  user.markModified('balances');
  await user.save();

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('balanceUpdate', {
      balances: Object.fromEntries(user.balances)
    });
  }

  res.status(200).json({
    success: true,
    balances: Object.fromEntries(user.balances)
  });
});

/**
 * @desc    Get Global Ledger Audit Trail
 * @route   GET /api/admin/ledger
 * @access  Private/Admin
 */
export const getGlobalLedger = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();

  const globalLedger = users.flatMap((user) =>
    (user.ledger || []).map((entry) => ({
      ...entry,
      username: user.username,
      email: user.email,
    }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
   .slice(0, 500);

  res.status(200).json({ success: true, data: globalLedger });
});

/**
 * @desc    Get Withdrawal Queue
 * @route   GET /api/admin/withdrawals
 * @access  Private/Admin
 */
export const getWithdrawals = asyncHandler(async (req, res) => {
  const users = await User.find({
    "ledger.status": "pending",
    "ledger.type": "withdrawal"
  }).lean();

  const withdrawals = users.flatMap(user =>
    user.ledger
      .filter(entry => entry.status === 'pending' && entry.type === 'withdrawal')
      .map(entry => ({
        _id: entry._id,
        userId: user._id,
        username: user.username,
        email: user.email,
        amount: entry.amount,
        currency: entry.currency,
        address: entry.address || 'N/A',
        status: entry.status,
        createdAt: entry.createdAt
      }))
  );

  res.status(200).json({ success: true, withdrawals });
});

/**
 * @desc    Process Withdrawal (Approve/Reject)
 * @route   PATCH /api/admin/withdrawal/:id
 * @access  Private/Admin
 */
export const processWithdrawal = asyncHandler(async (req, res) => {
  const { status, userId } = req.body; 
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const entry = user.ledger.id(req.params.id);
  if (!entry) {
    res.status(404);
    throw new Error('Transaction record not found');
  }

  if (entry.status !== 'pending') {
    res.status(400);
    throw new Error('Transaction already finalized');
  }

  // Refund logic for rejected extractions
  if (status === 'rejected') {
    const currentEur = user.balances.get('EUR') || 0;
    user.balances.set('EUR', currentEur + Math.abs(entry.amount));
    user.markModified('balances');
  }

  entry.status = status;
  await user.save();

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('notification', {
      type: status === 'completed' ? 'success' : 'error',
      message: `Withdrawal request for €${entry.amount} was ${status}`
    });
  }

  res.status(200).json({ success: true, message: `Transaction ${status} successfully` });
});

/**
 * @desc    Get Pending KYC Applications
 * @route   GET /api/admin/kyc/pending
 * @access  Private/Admin
 */
export const getPendingKYC = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ kycStatus: 'pending' })
    .select('name username email kycStatus updatedAt')
    .lean();
  
  res.status(200).json({ success: true, data: pendingUsers });
});

/**
 * @desc    Verify or Reject KYC Node
 * @route   PATCH /api/admin/kyc/:id
 * @access  Private/Admin
 */
export const verifyUserKYC = asyncHandler(async (req, res) => {
  const { status } = req.body; 
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Identity node not found.');
  }

  user.kycStatus = status;
  await user.save();

  const io = req.app.get('io');
  if (io) {
    io.to(user._id.toString()).emit('notification', {
      type: status === 'verified' ? 'success' : 'error',
      message: `KYC Update: Your identity status is now ${status.toUpperCase()}.`
    });
  }

  res.status(200).json({ success: true, message: `Node verified as ${status}` });
});

/**
 * @desc    Manual Trigger for Yield Engine
 * @route   POST /api/admin/trigger-roi
 * @access  Private/Admin
 */
export const triggerManualRoi = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  console.log('⚡ ROOT OVERRIDE: Distributing yield distribution manually...');
  const processedCount = await runYieldDistribution(io);
  res.status(200).json({
    success: true,
    message: `Yield distributed to ${processedCount} nodes successfully.`,
    processed: processedCount
  });
});
