import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js'; // Cleaner import

const router = express.Router();

/**
 * HELPER: Daily Profit Logic
 * Uses Date-based math to calculate ROI since last login/update.
 */
const applyDailyProfits = async (user) => {
  // Prevent logic run for users without active plans
  if (!user.plan || user.plan === 'None' || !user.dailyRate) return;

  const now = new Date();
  const lastUpdate = user.lastProfitUpdate ? new Date(user.lastProfitUpdate) : new Date(user.createdAt);
  
  // Calculate difference in days (24h chunks)
  const diffMs = now - lastUpdate;
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysElapsed > 0) {
    const profit = user.balance * (user.dailyRate / 100) * daysElapsed;

    if (profit > 0) {
      user.balance += Number(profit.toFixed(2));
      user.lastProfitUpdate = now;

      await Transaction.create({
        user: user._id,
        type: 'profit',
        amount: Number(profit.toFixed(2)),
        status: 'completed',
        description: `Daily yield accrual: ${user.plan}`,
      });

      await user.save();
    }
  }
};

// @route   GET /api/user/me
// @desc    Get user profile and sync profits
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await applyDailyProfits(user);

    res.json({
      success: true,
      user,
      // Provide frontend with global config if needed
      config: {
        btcWallet: process.env.BTC_WALLET_ADDRESS,
        minWithdraw: 10
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/user/balance
// @desc    Sync and return balance for Dashboard
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await applyDailyProfits(user);

    res.json({
      success: true,
      balance: user.balance,
      plan: user.plan,
      dailyRate: user.dailyRate
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Balance sync failed' });
  }
});

// @route   POST /api/user/withdraw
// @desc    Submit withdrawal request
router.post('/withdraw', protect, async (req, res) => {
  const { amount, address } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }

    // 1. Deduct balance immediately (Pending state)
    user.balance -= Number(amount);
    await user.save();

    // 2. Create Transaction (Pending Approval by Admin)
    const tx = await Transaction.create({
      user: user._id,
      type: 'withdrawal',
      amount: Number(amount),
      status: 'pending',
      btcAddress: address,
      description: 'Withdrawal to external wallet'
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Withdrawal failed' });
  }
});

export default router;

