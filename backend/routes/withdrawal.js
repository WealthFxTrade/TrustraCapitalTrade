// backend/routes/withdrawal.js
const express = require('express');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configurable settings (move to env/config later)
const MIN_WITHDRAWAL = 0.001; // BTC
const MAX_WITHDRAWAL_PER_DAY = 1; // BTC — example limit
const WITHDRAWAL_FEE_PERCENT = 0.001; // 0.1%

/**
 * USER: Request a withdrawal
 * POST /api/withdrawals
 */
router.post('/', protect, async (req, res) => {
  const { amount, btcAddress } = req.body;

  // Validation
  if (!amount || !btcAddress) {
    return res.status(400).json({
      success: false,
      message: 'Amount and BTC address are required',
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
  }

  if (amount < MIN_WITHDRAWAL) {
    return res.status(400).json({
      success: false,
      message: `Minimum withdrawal is ${MIN_WITHDRAWAL} BTC`,
    });
  }

  if (!/^bc1|[13][a-km-zA-HJ-NP-Z1-9]{25,39}$/.test(btcAddress)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Bitcoin address format',
    });
  }

  try {
    // Atomic balance check & deduction
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Calculate fee
    const fee = amount * WITHDRAWAL_FEE_PERCENT;
    const netAmount = amount - fee;

    // Deduct from balance
    user.balance -= amount;
    await user.save();

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      btcAddress,
      amount,
      fee,
      netAmount,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount,
        fee,
        netAmount,
        btcAddress,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing withdrawal request',
    });
  }
});

/**
 * ADMIN: Get all pending withdrawals
 * GET /api/withdrawals/pending
 */
router.get('/pending', protect, admin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * ADMIN: Update withdrawal status (approve / reject / sent)
 * PATCH /api/withdrawals/:id
 */
router.patch('/:id', protect, admin, async (req, res) => {
  const { status, txHash, adminNote } = req.body;

  if (!['approved', 'rejected', 'sent', 'failed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: approved, rejected, sent, failed',
    });
  }

  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update — withdrawal is already ${withdrawal.status}`,
      });
    }

    withdrawal.status = status;
    if (txHash) withdrawal.txHash = txHash.trim();
    if (adminNote) withdrawal.adminNote = adminNote.trim();

    // If rejected → refund balance
    if (status === 'rejected') {
      withdrawal.user.balance += withdrawal.amount;
      await withdrawal.user.save();
    }

    await withdrawal.save();

    res.json({
      success: true,
      message: `Withdrawal ${status}`,
      withdrawal,
    });
  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
