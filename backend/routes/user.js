import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import NodeCache from 'node-cache';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { protect } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

/* ---------------- UTILITY: Generate JWT ---------------- */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      throw new ApiError(400, 'Full name, email, and password are required');
    }

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    // Ensure unique BTC index using atomic increment
    const lastUser = await User.findOneAndUpdate(
      {},
      { $inc: { btcIndexCounter: 1 } },
      { sort: { btcIndex: -1 }, upsert: true, new: true }
    ).select('btcIndex');

    const nextIndex = lastUser ? lastUser.btcIndex : 0;
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, nextIndex);

    const newUser = await User.create({
      fullName,
      email: emailLower,
      password, // hashed via pre-save hook in User model
      role: 'user',
      btcIndex: nextIndex,
      btcAddress,
      balances: new Map([
        ['BTC', 0],
        ['USD', 0],
        ['USDT', 0]
      ]),
      ledger: [],
      plan: 'none',
      isActive: true
    });

    res.status(201).json({
      success: true,
      token: generateToken(newUser._id, newUser.role),
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        btcAddress: newUser.btcAddress,
        role: newUser.role,
        balances: Object.fromEntries(newUser.balances)
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- LOGIN ---------------- */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (user.banned) throw new ApiError(403, 'Account suspended. Contact support.');

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        btcAddress: user.btcAddress,
        balances: Object.fromEntries(user.balances),
        plan: user.plan
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- BALANCE (Hardened) ---------------- */
router.get('/balance', protect, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) throw new ApiError(401, 'Authentication failed: No User ID');

    const cachedBalances = cache.get(userId);
    if (cachedBalances) {
      return res.json({ success: true, data: cachedBalances, source: 'cache' });
    }

    const user = await User.findById(userId).select('balances').lean();
    if (!user) throw new ApiError(404, 'User not found');

    // Safe Map/Object handling for Mongoose lean()
    const b = user.balances || {};
    const balances = {
      BTC: (b instanceof Map ? b.get('BTC') : b.BTC) ?? 0,
      USD: (b instanceof Map ? b.get('USD') : b.USD) ?? 0,
      USDT: (b instanceof Map ? b.get('USDT') : b.USDT) ?? 0
    };

    cache.set(userId, balances);
    res.json({ success: true, data: balances, source: 'db' });
  } catch (err) {
    next(err);
  }
});

/* ---------------- TRANSACTIONS (FOR LEDGER SYNC) ---------------- */
router.get('/transactions/my', protect, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('ledger');
    if (!user) throw new ApiError(404, 'User not found');

    const sortedLedger = user.ledger.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      count: sortedLedger.length,
      data: sortedLedger
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- FORGOT/RESET PASSWORD ---------------- */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
    }
    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) throw new ApiError(400, 'Password too short');

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, 'Token invalid or expired');

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

// CRITICAL FIX: The default export for app.js
export default router;

