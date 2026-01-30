// backend/routes/transaction.js
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';

const router = express.Router();

// Deposit request (user)
router.post('/deposit', protect, async (req, res) => {
  const { amount, method } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount > 0 required' });
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Withdrawal request (user)
router.post('/withdraw', protect, async (req, res) => {
  const { amount, btcAddress } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Amount > 0 required' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    user.balance -= amount;
    await user.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      signedAmount: -amount,
      status: 'pending',
      walletAddress: btcAddress,
    });

    await Withdrawal.create({
      user: req.user._id,
      btcAddress,
      amount,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Withdrawal request submitted', tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User transaction history
router.get('/my', protect, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, transactions });
});

// Admin pending withdrawals
router.get('/pending-withdrawals', protect, admin, async (req, res) => {
  const withdrawals = await Withdrawal.find({ status: 'pending' })
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });

  res.json({ success: true, withdrawals });
});

export default router;
