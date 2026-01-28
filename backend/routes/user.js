// backend/routes/user.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Token verification middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Deposit funds
router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.balance += Number(amount);
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw funds
router.post('/withdraw', auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

    user.balance -= Number(amount);
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;  // ONLY ONE of these – remove any other export default or module.exports
