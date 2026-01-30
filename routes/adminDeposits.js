// backend/routes/adminDeposits.js
const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All routes admin-only
router.use(protect, admin);

/**
 * GET pending deposits
 */
router.get('/', async (req, res) => {
  try {
    const deposits = await Transaction.find({ type: 'deposit', status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: deposits.length,
      deposits,
    });
  } catch (err) {
    console.error('Pending deposits error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH approve deposit
 */
router.patch('/:id/approve', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx || tx.type !== 'deposit') {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Already processed' });
    }

    const user = await User.findById(tx.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.balance += tx.amount;
    tx.status = 'approved';

    await user.save();
    await tx.save();

    res.json({ success: true, message: 'Deposit approved and balance updated' });
  } catch (err) {
    console.error('Approve deposit error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH reject deposit
 */
router.patch('/:id/reject', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx || tx.type !== 'deposit') {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    tx.status = 'rejected';
    await tx.save();

    res.json({ success: true, message: 'Deposit rejected' });
  } catch (err) {
    console.error('Reject deposit error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
