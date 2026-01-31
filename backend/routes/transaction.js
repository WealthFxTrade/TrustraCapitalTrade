// backend/routes/transaction.js
import express from 'express';
import mongoose from 'mongoose';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

/* ---------------- DEPOSIT REQUEST (USER) ---------------- */
router.post('/deposit', protect, async (req, res) => {
  const { amount, method = 'crypto', currency = 'USD' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
  }

  if (!['crypto', 'bank', 'wallet', 'manual'].includes(method)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method' });
  }

  try {
    const tx = await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      signedAmount: amount,
      currency,
      method,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted – awaiting admin approval',
      transaction: tx,
    });
  } catch (err) {
    console.error('[DEPOSIT ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Server error during deposit' });
  }
});

/* ---------------- WITHDRAWAL REQUEST (USER) ---------------- */
router.post('/withdraw', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, btcAddress } = req.body;

    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!btcAddress || !btcAddress.trim()) {
      throw new Error('BTC withdrawal address is required');
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) throw new Error('User not found');

    if (user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct balance
    user.balance -= amount;
    await user.save({ session });

    // Create transaction record
    const tx = await Transaction.create([{
      user: req.user._id,
      type: 'withdrawal',
      amount,
      signedAmount: -amount,
      currency: 'BTC',
      method: 'crypto',
      status: 'pending',
      walletAddress: btcAddress.trim(),
    }], { session });

    // Create withdrawal record
    await Withdrawal.create([{
      user: req.user._id,
      amount,
      btcAddress: btcAddress.trim(),
      status: 'pending',
      transaction: tx[0]._id,
    }], { session });

    // Audit log
    await AuditLog.create([{
      admin: null, // user-initiated
      action: 'WITHDRAWAL_REQUEST',
      targetId: tx[0]._id,
      targetModel: 'Transaction',
      metadata: { amount, btcAddress: btcAddress.trim(), userId: user._id },
      ip: req.ip,
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted – awaiting admin approval',
      transaction: tx[0],
    });
  } catch (err) {
    await session.abortTransaction();
    console.error('[WITHDRAWAL ERROR]', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

/* ---------------- USER TRANSACTION HISTORY ---------------- */
router.get('/my', protect, async (req, res) => {
  try {
    const { type, status, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[TRANSACTION HISTORY ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction history' });
  }
});

/* ---------------- ADMIN: PENDING WITHDRAWALS ---------------- */
router.get('/pending-withdrawals', protect, admin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      withdrawals,
      count: withdrawals.length,
    });
  } catch (err) {
    console.error('[PENDING WITHDRAWALS ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch pending withdrawals' });
  }
});

export default router;
