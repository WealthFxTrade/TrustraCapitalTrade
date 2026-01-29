// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendVerificationEmail from '../utils/email.js';

const router = express.Router();

// =============================================
// REGISTER / SIGNUP
// =============================================
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Input validation
    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check duplicate
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    user = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err.stack || err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// =============================================
// VERIFY EMAIL
// =============================================
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('[VERIFY EMAIL ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================================
// LOGIN
// =============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
