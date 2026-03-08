import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { runYieldDistribution } from '../utils/rioEngine.js';

/**
 * @desc    Get Dashboard Statistics
 * @route   GET /api/admin/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  
  // Logic: Correctly extract EUR from the Map-based balances
  const totalDeposits = users.reduce((acc, u) => {
    const eurBalance = u.balances instanceof Map 
      ? u.balances.get('EUR') 
      : (u.balances?.EUR || 0);
    return acc + eurBalance;
  }, 0);

  res.status(200).json({
    success: true,
    totalUsers: users.length,
    totalDeposits,
    pendingWithdrawals: users.reduce((acc, u) => 
      acc + (u.ledger?.filter(l => l.type === 'withdrawal' && l.status === 'pending').length || 0), 0),
    activeNodes: users.filter(u => u.activePlan && u.activePlan !== 'none').length
  });
});

/**
 * @desc    Get System Infrastructure & Solvency Metrics
 * @route   GET /api/admin/health
 */
export const getSystemHealth = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  let totalAUM = 0;
  let totalRoiLiability = 0;

  users.forEach((user) => {
    // Handling Map conversion for lean() queries
    const balances = user.balances || {};
    totalAUM += balances.EUR || 0;
    totalRoiLiability += balances.ROI || 0;
  });

  res.status(200).json({
    success: true,
    data: {
      dbLatency: 14, // Simulated latency in ms
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
 * @route   GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: users.length, data: users });
});

/**
 * @desc    Update user balance manually (Admin Override)
 * @route   PUT /api/admin/users/:id/balance
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
  
  // Apply update
  user.balances.set(balanceType, type === 'add' ? currentVal + change : currentVal - change);

  // Document in Ledger
  user.ledger.push({
    amount: type === 'add' ? change : -change,
    currency: balanceType.toUpperCase(),
    type: type === 'add' ? 'deposit' : 'withdrawal',
    status: 'completed',
    description: `ADMIN OVERRIDE: ${type.toUpperCase()} by ${req.user.username}`,
  });

  // Signal change to Mongoose
  user.markModified('balances');
  await user.save();

  // Real-time Push
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
 */
export const getGlobalLedger = asyncHandler(async (req, res) => {
  const users = await User.find({}).lean();
  
  const globalLedger = users.flatMap((user) =>
    (user.ledger || []).map((entry) => ({
      ...entry,
      username: user.username,
      email: user.email,
    }))
  ).sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
   .slice(0, 200);

  res.status(200).json({ success: true, data: globalLedger });
});

/**
 * @desc    Get Withdrawal Queue
 * @route   GET /api/admin/withdrawals
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
 * @route   PATCH /api/admin/withdrawal/:id
 */
export const processWithdrawal = asyncHandler(async (req, res) => {
  const { status, userId } = req.body;
  const user = await User.findById(userId);
  
  if (!user) throw new Error('User not found');
  
  const entry = user.ledger.id(req.params.id);
  if (!entry) throw new Error('Transaction record not found');

  // If rejected, refund the balance to the EUR wallet
  if (status === 'rejected' && entry.status === 'pending') {
    const currentEur = user.balances.get('EUR') || 0;
    user.balances.set('EUR', currentEur + Math.abs(entry.amount));
    user.markModified('balances');
  }

  entry.status = status;
  await user.save();
  
  res.status(200).json({ success: true, message: `Transaction ${status.toUpperCase()} successfully` });
});

/**
 * @desc    Manual Trigger for RIO Engine
 * @route   POST /api/admin/trigger-roi
 */
export const triggerManualRoi = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  
  console.log('⚡ MANUAL OVERRIDE: Distributing yield to all active nodes...');
  const processedCount = await runYieldDistribution(io);
  
  res.status(200).json({ 
    success: true, 
    message: `Yield successfully distributed to ${processedCount} nodes.`,
    processed: processedCount 
  });
});
