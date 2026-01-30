// backend/routes/transaction.js
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';

const router = express.Router();

/* ---------------- DEPOSIT REQUEST (USER) ---------------- */
router.post('/deposit', protect, async (req, res) => {
  const { amount, method } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
  }

  try {
    const tx = await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      signedAmount: amount,
      method: method || 'manual',
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Deposit request submitted', tx });
  } catch (err) {
    console.error('[DEPOSIT ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error during deposit' });
  }
});

/* ---------------- WITHDRAWAL REQUEST (USER) ---------------- */
router.post('/withdraw', protect, async (req, res) => {
  const { amount, btcAddress } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance -= amount;
    await user.save();

    // Create transaction
    const tx = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      signedAmount: -amount,
      status: 'pending',
      walletAddress: btcAddress,
    });

    // Create withdrawal record
    await Withdrawal.create({
      user: req.user._id,
      btcAddress,
      amount,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Withdrawal request submitted', tx });
  } catch (err) {
    console.error('[WITHDRAWAL ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error during withdrawal' });
  }
});

/* ---------------- USER TRANSACTION HISTORY ---------------- */
router.get('/my', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, transactions });
  } catch (err) {
    console.error('[TRANSACTION HISTORY ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error fetching transactions' });
  }
});

/* ---------------- ADMIN: PENDING WITHDRAWALS ---------------- */
router.get('/pending-withdrawals', protect, admin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
  } catch (err) {
    console.error('[PENDING WITHDRAWALS ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error fetching pending withdrawals' });
  }
});

export default router;
