import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect, admin } from '../middleware/auth.js'; 
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/* ---------------- DEPOSIT (USER/ADMIN) ---------------- */
router.post('/deposit', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, currency, description, method = 'manual' } = req.body;
    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid deposit amount');
    if (!currency) throw new ApiError(400, 'Currency is required');

    const user = await User.findById(req.user._id).session(session);
    if (!user) throw new ApiError(404, 'User not found');

    const currencyKey = currency.toUpperCase();
    const currentBalance = user.balances.get(currencyKey) || 0;

    // 1. Update balances map
    user.balances.set(currencyKey, currentBalance + Number(amount));

    // 2. Add to Ledger array
    user.ledger.push({
      amount: Number(amount),
      signedAmount: Math.abs(Number(amount)),
      currency: currencyKey,
      type: 'deposit',
      source: method,
      status: 'completed',
      description: description || 'Account deposit'
    });

    await user.save({ session });

    // 3. Create standalone Transaction record
    const tx = await Transaction.create([{
      user: user._id,
      type: 'deposit',
      amount: Number(amount),
      currency: currencyKey,
      method,
      status: 'completed',
      description
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ 
      success: true, 
      message: 'Deposit successful', 
      balances: user.balances,
      transaction: tx[0]
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

/* ---------------- WITHDRAWAL REQUEST (USER) ---------------- */
router.post('/withdraw', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, currency, btcAddress, description } = req.body;
    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid withdrawal amount');
    if (!currency) throw new ApiError(400, 'Currency is required');
    if (!btcAddress) throw new ApiError(400, 'BTC withdrawal address is required');

    const user = await User.findById(req.user._id).session(session);
    const currencyKey = currency.toUpperCase();
    const currentBalance = user.balances.get(currencyKey) || 0;

    if (currentBalance < amount) throw new ApiError(400, 'Insufficient balance');

    // 1. Deduct from balances
    user.balances.set(currencyKey, currentBalance - Number(amount));

    // 2. Add pending ledger entry
    user.ledger.push({
      amount: Number(amount),
      signedAmount: -Math.abs(Number(amount)),
      currency: currencyKey,
      type: 'withdrawal',
      source: 'wallet',
      status: 'pending',
      description: description || `Withdrawal to ${btcAddress}`
    });

    await user.save({ session });

    // 3. Create Transaction record
    const tx = await Transaction.create([{
      user: user._id,
      type: 'withdrawal',
      amount: Number(amount),
      currency: currencyKey,
      status: 'pending',
      walletAddress: btcAddress,
      description
    }], { session });

    await session.commitTransaction();
    res.json({ 
      success: true, 
      message: 'Withdrawal request pending admin approval', 
      balances: user.balances,
      transaction: tx[0]
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

/* ---------------- MY TRANSACTIONS ---------------- */
router.get('/my', protect, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
});

/* ---------------- ADMIN: PENDING WITHDRAWALS ---------------- */
router.get('/pending-withdrawals', protect, admin, async (req, res, next) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
  } catch (err) {
    next(err);
  }
});

export default router;

