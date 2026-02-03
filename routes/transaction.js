// backend/routes/transaction.js
import express from 'express';
import mongoose from 'mongoose';
<<<<<<< HEAD
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

=======
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/* ---------------- WITHDRAWAL ---------------- */
router.post('/withdraw', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested)
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

<<<<<<< HEAD
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
=======
    const { amount, currency, description } = req.body;
    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid withdrawal amount');
    if (!currency) throw new ApiError(400, 'Currency is required');
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested)

    // Fetch user within session
    const user = await User.findById(req.user._id).session(session);
<<<<<<< HEAD
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
=======
    const currentBalance = user.balances.get(currency.toUpperCase()) || 0;

    if (currentBalance < amount) throw new ApiError(400, 'Insufficient balance');

    // Deduct balance
    user.balances.set(currency.toUpperCase(), currentBalance - amount);

    // Add ledger entry
    user.ledger.push({
      amount,
      signedAmount: -Math.abs(amount),
      currency: currency.toUpperCase(),
      type: 'withdrawal',
      source: 'wallet',
      status: 'pending',
      description
    });

    await user.save({ session });

    // Create transaction record
    await Transaction.create([{
      user: user._id,
      type: 'withdrawal',
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      description
    }], { session });

    await session.commitTransaction();
    res.json({ success: true, message: 'Withdrawal pending', balances: user.balances });
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested)
  } catch (err) {
    await session.abortTransaction();
    console.error('[WITHDRAWAL ERROR]', err.message);
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

<<<<<<< HEAD
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
=======
/* ---------------- MY TRANSACTIONS ---------------- */
router.get('/my', protect, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, transactions });
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested)
  } catch (err) {
    console.error('[TRANSACTION HISTORY ERROR]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch transaction history' });
  }
});

<<<<<<< HEAD
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
=======
/* ---------------- DEPOSIT (Admin or User) ---------------- */
router.post('/deposit', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, currency, description } = req.body;
    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid deposit amount');
    if (!currency) throw new ApiError(400, 'Currency is required');

    const user = await User.findById(req.user._id).session(session);
    const currentBalance = user.balances.get(currency.toUpperCase()) || 0;

    // Add balance
    user.balances.set(currency.toUpperCase(), currentBalance + amount);

    // Add ledger entry
    user.ledger.push({
      amount,
      signedAmount: Math.abs(amount),
      currency: currency.toUpperCase(),
      type: 'deposit',
      source: 'wallet',
      status: 'completed',
      description
    });

    await user.save({ session });

    // Create transaction record
    await Transaction.create([{
      user: user._id,
      type: 'deposit',
      amount,
      currency: currency.toUpperCase(),
      status: 'completed',
      description
    }], { session });

    await session.commitTransaction();
    res.json({ success: true, message: 'Deposit successful', balances: user.balances });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
>>>>>>> fbdba30 (Backend ready: server running, MongoDB connected, auth tested)
  }
});

export default router; // Safe default export
