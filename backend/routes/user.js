import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// =====================
// Token verification middleware
// =====================
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// =====================
// Apply daily profits helper
// =====================
const applyDailyProfits = (user) => {
  const now = new Date();
  const lastUpdate = user.lastProfitUpdate || now;
  const daysElapsed = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

  if (daysElapsed > 0 && user.dailyRate > 0) {
    const profit = user.balance * user.dailyRate * daysElapsed;
    user.balance += profit;
    user.lastProfitUpdate = now;
  }
};

// =====================
// Get current user info
// =====================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    applyDailyProfits(user);
    await user.save();

    res.json({
      success: true,
      user,
      wallet: process.env.BTC_WALLET_ADDRESS,
      dailyRate: user.dailyRate,
    });
  } catch (err) {
    console.error('[USER /me ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================
// Deposit funds
// =====================
router.post('/deposit', auth, async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Apply profits before deposit
    applyDailyProfits(user);

    user.balance += amount;
    await user.save();

    res.json({
      success: true,
      message: 'Deposit successful',
      user,
      wallet: process.env.BTC_WALLET_ADDRESS,
      dailyRate: user.dailyRate,
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
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Apply profits before withdrawal
    applyDailyProfits(user);

    if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

    user.balance -= amount;
    await user.save();

    res.json({
      success: true,
      message: 'Withdrawal successful',
      user,
      wallet: process.env.BTC_WALLET_ADDRESS,
      dailyRate: user.dailyRate,
    });
  } catch (err) {
    console.error('[WITHDRAW ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
