import User from '../models/User.js';
import KYC from '../models/KYC.js';
import AuditLog from '../models/AuditLog.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import mongoose from 'mongoose';
import os from 'os';

/**
 * ── 1. HQ ANALYTICS ──
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const users = await User.find({ isBanned: false });
    let totalCapital = 0;
    let totalProfit = 0;

    users.forEach(user => {
      totalCapital += user.balances.get('EUR') || 0;
      totalProfit += user.balances.get('ROI') || 0;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalCapital,
        totalProfit,
        activeUsers: users.length,
        pendingKyc: await KYC.countDocuments({ status: 'pending' }),
        systemStatus: 'Optimal'
      }
    });
  } catch (err) { next(err); }
};

/**
 * ── 2. USER & LEDGER MANAGEMENT ──
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) { next(err); }
};

export const updateUserBalance = async (req, res, next) => {
  try {
    const { amount, balanceType, type } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "Node not found.");

    const currentVal = user.balances.get(balanceType) || 0;
    const numericAmount = parseFloat(amount);

    if (type === 'add') {
      user.balances.set(balanceType, currentVal + numericAmount);
    } else {
      user.balances.set(balanceType, Math.max(0, currentVal - numericAmount));
    }

    await user.save();
    res.status(200).json({ success: true, message: "Ledger updated." });
  } catch (err) { next(err); }
};

export const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBanned = !user.isBanned;
    await user.save();
    res.status(200).json({ success: true, isBanned: user.isBanned });
  } catch (err) { next(err); }
};

/**
 * ── 3. WITHDRAWAL & AUDIT PROTOCOLS ──
 */
export const getAllWithdrawals = async (req, res, next) => {
  try {
    // Aggregates withdrawals from all user ledgers
    const users = await User.find({ "ledger.type": "withdrawal" }).select('username email ledger');
    let withdrawals = [];
    users.forEach(u => {
      u.ledger.filter(l => l.type === 'withdrawal').forEach(w => {
        withdrawals.push({ ...w.toObject(), username: u.username, email: u.email, userId: u._id });
      });
    });
    res.status(200).json({ success: true, withdrawals: withdrawals.sort((a,b) => b.createdAt - a.createdAt) });
  } catch (err) { next(err); }
};

export const processWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findOne({ "ledger._id": id });
    const entry = user.ledger.id(id);
    
    if (status === 'rejected') {
      const currentRoi = user.balances.get('ROI') || 0;
      user.balances.set('ROI', currentRoi + entry.amount);
    }
    entry.status = status;
    await user.save();
    res.status(200).json({ success: true, message: `Extraction ${status}` });
  } catch (err) { next(err); }
};

/**
 * ── 4. SYSTEM TELEMETRY ──
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      success: true,
      metrics: {
        uptime: os.uptime(),
        dbLatency: `${Date.now() - start}ms`,
        platform: os.platform(),
        memory: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
      }
    });
  } catch (err) { next(err); }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('admin', 'username').sort({ timestamp: -1 }).limit(50);
    res.status(200).json({ success: true, logs });
  } catch (err) { next(err); }
};
