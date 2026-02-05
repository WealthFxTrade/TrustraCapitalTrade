import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/** 
 * HELPER: Daily Profit Logic
 * Calculates ROI since last login/update for active plans.
 */
const applyDailyProfits = async (user) => {
  if (!user.plan || user.plan === 'None' || !user.dailyRate) return;

  const now = new Date();
  const lastUpdate = user.lastProfitUpdate ? new Date(user.lastProfitUpdate) : new Date(user.createdAt);
  const diffMs = now - lastUpdate;
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysElapsed > 0) {
    const profit = Number((user.balance * (user.dailyRate / 100) * daysElapsed).toFixed(2));

    if (profit > 0) {
      user.balance += profit;
      user.lastProfitUpdate = now;

      await Transaction.create({
        user: user._id,
        type: 'profit',
        amount: profit,
        status: 'completed',
        description: `Daily yield accrual: ${user.plan}`,
      });
      await user.save();
    }
  }
};

// @route   GET /api/user/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await applyDailyProfits(user);
    res.json({
      success: true,
      user,
      config: { btcWallet: process.env.BTC_WALLET_ADDRESS, minWithdraw: 10 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/user/balance
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await applyDailyProfits(user);
    res.json({ success: true, balance: user.balance, plan: user.plan, dailyRate: user.dailyRate });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Balance sync failed' });
  }
});

// @route   GET /api/transactions/my
router.get('/transactions/my', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, transactions: transactions || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not retrieve ledger' });
  }
});

/**
 * @route   GET /api/wallet/address
 * @desc    NEW: Generate/Retrieve deposit address for user
 */
router.get('/wallet/address', protect, async (req, res) => {
  try {
    const { currency } = req.query; // BTC, ETH, USDT
    
    // In 2026, we pull the master wallet from .env for security
    // Or you can implement a logic here to generate a unique sub-address
    const masterWallet = process.env[`${currency}_WALLET_ADDRESS`] || process.env.BTC_WALLET_ADDRESS;

    if (!masterWallet) {
      return res.status(500).json({ success: false, message: `${currency} wallet not configured on server` });
    }

    res.json({
      success: true,
      address: masterWallet,
      currency: currency || 'BTC'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Address generation failed' });
  }
});

// @route   POST /api/user/withdraw
router.post('/withdraw', protect, async (req, res) => {
  const { amount, address } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });
    user.balance -= Number(amount);
    await user.save();
    const tx = await Transaction.create({
      user: user._id,
      type: 'withdrawal',
      amount: Number(amount),
      status: 'pending',
      btcAddress: address,
      description: 'Withdrawal to external wallet',
    });
    res.json({ success: true, message: 'Withdrawal request submitted', transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Withdrawal failed' });
  }
});

export default router;

