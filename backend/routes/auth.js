import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ============================
// REGISTER / SIGNUP
// ============================
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Check existing user
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(12); // production-safe
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ email, password: hashedPassword, fullName });
    await user.save();

    // Generate JWT
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Respond with token + BTC wallet
    res.status(201).json({
      message: 'Signup successful',
      token,
      user: { id: user._id, email: user.email, fullName },
      wallet: process.env.BTC_WALLET_ADDRESS,
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================
// LOGIN
// ============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName },
      wallet: process.env.BTC_WALLET_ADDRESS,
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
