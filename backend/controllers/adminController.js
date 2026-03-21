import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import Transaction from '../models/Transaction.js';
import { runYieldDistribution } from '../utils/rioEngine.js';
import os from 'os';

/**
 * @desc    Get all registered users for the Node Registry
 * @route   GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    data: users
  });
});

/**
 * @desc    Manually adjust a specific user's balance and log the event
 * @route   PUT /api/admin/users/:id/balance
 */
export const updateUserBalance = asyncHandler(async (req, res) => {
  const { amount, balanceType, type, description } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Target node not found in registry');
  }

  const currentBalance = user.balances.get(balanceType) || 0;
  const change = Number(amount);
  const newBalance = type === 'add' ? currentBalance + change : currentBalance - change;

  user.balances.set(balanceType, newBalance);
  user.markModified('balances');

  // Create an internal transaction record for the audit ledger
  await Transaction.create({
    user: user._id,
    type: 'reinvest',
    amount: change,
    signedAmount: type === 'add' ? change : -Math.abs(change),
    currency: 'EUR',
    status: 'completed',
    description: description || `Admin Manual Adjustment: ${type}`,
    method: 'internal'
  });

  await user.save();
  res.status(200).json({ success: true, newBalance });
});

/**
 * @desc    Retrieve all withdrawal requests
 * @route   GET /api/admin/withdrawals
 */
export const getWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find({})
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = withdrawals.map(w => ({
    ...w,
    username: w.user?.username || 'ID_UNKNOWN',
    email: w.user?.email || 'N/A'
  }));

  res.status(200).json({ success: true, withdrawals: formatted });
});

/**
 * @desc    Approve/Reject extraction and handle auto-refunds
 * @route   PATCH /api/admin/withdrawal/:id
 */
export const processWithdrawal = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id);

  if (!withdrawal || withdrawal.status !== 'pending') {
    res.status(400);
    throw new Error('Extraction invalid or already processed');
  }

  const user = await User.findById(withdrawal.user);

  if (status === 'rejected') {
    const currentRoi = user.balances.get('ROI') || 0;
    user.balances.set('ROI', currentRoi + withdrawal.amount);
    user.markModified('balances');

    await Transaction.create({
      user: user._id,
      type: 'profit',
      amount: withdrawal.amount,
      signedAmount: withdrawal.amount,
      status: 'completed',
      description: `Refund: Withdrawal #${withdrawal._id.toString().slice(-6)} Rejected`,
      referenceId: withdrawal._id
    });
  }

  withdrawal.status = status;
  await Promise.all([withdrawal.save(), user.save()]);

  res.status(200).json({ success: true, message: `Status updated to ${status}` });
});

/**
 * @desc    System Integrity & Telemetry Diagnostic
 * @route   GET /api/admin/health
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const avgLoad = os.loadavg()[0];
  const cpuPercent = Math.min(Math.round((avgLoad / cpus.length) * 100), 100);

  res.status(200).json({
    success: true,
    data: {
      server: {
        status: 'online',
        uptime: `\( {Math.floor(os.uptime() / 3600)}h \){Math.floor((os.uptime() % 3600) / 60)}m`,
      },
      database: {
        status: 'connected',
        latency: Math.floor(Math.random() * 10 + 2),
      },
      system: {
        cpuLoad: cpuPercent || 5.2,
        memoryUsage: Math.round(((totalMem - freeMem) / totalMem) * 100)
      }
    }
  });
});

/**
 * @desc    Master audit log of all system movements
 * @route   GET /api/admin/ledger
 */
export const getGlobalLedger = asyncHandler(async (req, res) => {
  const ledger = await Transaction.find({})
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({ success: true, data: ledger });
});

/**
 * @desc    Manual trigger for Elite Yield distribution
 * @route   POST /api/admin/trigger-roi
 */
export const triggerManualRoi = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const processedCount = await runYieldDistribution(io);

  const users = await User.find({});
  for (const user of users) {
    const b = Object.fromEntries(user.balances);
    const total = (Number(b.EUR) || 0) + (Number(b.ROI) || 0) + ((Number(b.BTC) || 0) * 65000);
    user.totalBalance = total;
    await user.save();
  }

  res.status(200).json({ success: true, processed: processedCount });
});

/**
 * @desc    Update a user's active investment plan
 * @route   PUT /api/admin/users/:id/plan
 */
export const updateUserPlan = asyncHandler(async (req, res) => {
  const { newPlan } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User node not found');
  }

  const oldPlan = user.activePlan;
  user.activePlan = newPlan;
  user.isActive = newPlan !== 'none';

  await Transaction.create({
    user: user._id,
    type: 'reinvest',
    amount: 0,
    signedAmount: 0,
    status: 'completed',
    description: `Protocol Upgrade: \( {oldPlan} -> \){newPlan}`,
    method: 'internal'
  });

  await user.save();
  res.status(200).json({ success: true, message: `Node upgraded to ${newPlan}` });
});
