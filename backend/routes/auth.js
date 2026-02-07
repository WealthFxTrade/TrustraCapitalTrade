// /routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { protect } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import NodeCache from 'node-cache';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const cache = new NodeCache({ stdTTL: 60 }); 

/* ---------------- UTILITY: Generate JWT ---------------- */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/* ---------------- REGISTER (Updated for EUR) ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      throw new ApiError(400, 'Full name, email, and password are required');

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    // Atomic increment for BTC HD Wallet Indexing
    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true }, 
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true }
    );

    const nextIndex = counterDoc.btcIndexCounter;
    // Derive unique BTC address for the investor
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, nextIndex);

    const newUser = await User.create({
      fullName,
      email: emailLower,
      password,
      role: 'user',
      btcIndex: nextIndex,
      btcAddress,
      // FIXED: Standardized to EUR for 2026 Rio Series compliance
      balances: new Map([
        ['BTC', 0],
        ['EUR', 0], 
        ['USDT', 0]
      ]),
      ledger: [],
      plan: 'none',
      isPlanActive: false,
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
        balances: Object.fromEntries(newUser.balances),
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
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password)))
      throw new ApiError(401, 'Invalid credentials');

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
        plan: user.plan,
        isPlanActive: user.isPlanActive
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- BALANCE (Updated for EUR) ---------------- */
router.get('/balance', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const cachedBalances = cache.get(userId);
    
    if (cachedBalances) {
      return res.json({ success: true, data: cachedBalances, source: 'cache' });
    }

    const user = await User.findById(userId).select('balances');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // FIXED: Mapping EUR key to ensure Dashboard sync
    const balances = {
      BTC: user.balances?.get('BTC') ?? 0,
      EUR: user.balances?.get('EUR') ?? 0,
      USDT: user.balances?.get('USDT') ?? 0
    };

    cache.set(userId, balances);
    res.json({ success: true, data: balances, source: 'db' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

