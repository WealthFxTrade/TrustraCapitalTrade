// backend/routes/user.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js'; // assuming you have this model

const router = express.Router();

// =====================
// JWT Authentication Middleware
// =====================
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE]', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// =====================
// Helper: Apply daily profits if needed
// =====================
const applyDailyProfits = async (user) => {
  if (!user.plan || user.plan === 'None' || !user.dailyRate) return;

  const now = new Date();
  const lastUpdate = user.lastProfitUpdate || now;
  const daysElapsed = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

  if (daysElapsed > 0) {
    const profit = user.balance * user.dailyRate * daysElapsed;

    if (profit > 0) {
      user.balance += profit;
      user.lastProfitUpdate = now;

      // Log profit as transaction
      await Transaction.create({
        user: user._id,
        type: 'profit',
        amount: profit,
        description: `Daily profit accrual (${user.plan})`,
      });

      await user.save();
    }
  }
};

// =====================
// Get current user info (profile + balance + plan)
// =====================
router.get('/me', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Apply pending profits
    await applyDailyProfits(user);

    res.json({
      success: true,
      user,
      wallet: process.env.BTC_WALLET_ADDRESS || 'Not configured',
      dailyRate: user.dailyRate || 0,
    });
  } catch (err) {
    console.error('[USER /me ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================
// Get current balance only (Used by Dashboard)
// =====================
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Apply profits before returning balance
    await applyDailyProfits(user);

    res.json({
      success: true,
      balance: user.balance || 0,
      plan: user.plan || 'Basic',
      dailyRate: user.dailyRate || 0,
    });
  } catch (err) {
    console.error('[BALANCE ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================
// Deposit funds
// =====================
router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Apply profits before deposit
    await applyDailyProfits(user);

    user.balance += Number(amount);
    await user.save();

    // Log deposit transaction
    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount,
      description: 'User deposit',
    });

    res.json({
      success: true,
      message: 'Deposit successful',
      user,
      wallet: process.env.BTC_WALLET_ADDRESS || 'Not configured',
      dailyRate: user.dailyRate || 0,
    });
  } catch (err) {
    console.error('[DEPOSIT ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================
// Withdraw funds
// =====================
router.post('/withdraw', auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Apply profits before withdrawal
    await applyDailyProfits(user);

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    user.balance -= Number(amount);
    await user.save();

    // Log withdrawal transaction
    await Transaction.create({
      user: user._id,
      type: 'withdrawal',
      amount: -amount,
      description: 'User withdrawal',
    });

    res.json({
      success: true,
      message: 'Withdrawal successful',
      user,
      wallet: process.env.BTC_WALLET_ADDRESS || 'Not configured',
      dailyRate: user.dailyRate || 0,
    });
  } catch (err) {
    console.error('[WITHDRAW ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================
// Get transaction history
// =====================
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // optional limit

    res.json({
      success: true,
      transactions,
    });
  } catch (err) {
    console.error('[TRANSACTIONS ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
