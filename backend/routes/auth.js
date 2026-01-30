// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateBtcAddress } from '../utils/generateBtcAddress.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d'; // token validity

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate BTC wallet index
    const lastUser = await User.findOne().sort({ btcIndex: -1 });
    const nextIndex = lastUser ? lastUser.btcIndex + 1 : 0;

    // Create user
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      btcIndex: nextIndex,
      btcAddress: generateBtcAddress(nextIndex), // custodial BTC address
    });

    // TODO: send verification email with token if needed

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        btcAddress: newUser.btcAddress,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

/* ---------------- LOGIN ---------------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        btcAddress: user.btcAddress,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

/* ---------------- FORGOT PASSWORD ---------------- */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 3600 * 1000; // 1h
    await user.save();

    // TODO: send email with reset link containing token
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('[FORGOT PASSWORD ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ---------------- RESET PASSWORD ---------------- */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 12);
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('[RESET PASSWORD ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
