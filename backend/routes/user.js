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
const cache = new NodeCache({ stdTTL: 60 });

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

/* --- AUTHENTICATION --- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) throw new ApiError(400, 'All fields are required');

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    const lastUser = await User.findOneAndUpdate({}, { $inc: { btcIndexCounter: 1 } }, { sort: { btcIndex: -1 }, upsert: true, new: true });
    const nextIndex = lastUser ? lastUser.btcIndex : 0;
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, nextIndex);

    const newUser = await User.create({
      fullName, email: emailLower, password, role: 'user', btcIndex: nextIndex, btcAddress,
      balances: new Map([['BTC', 0], ['USD', 0], ['USDT', 0]]), isActive: true
    });

    res.status(201).json({ success: true, token: generateToken(newUser._id, newUser.role), user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, btcAddress: newUser.btcAddress, balances: Object.fromEntries(newUser.balances) }});
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
    res.json({ success: true, token: generateToken(user._id, user.role), user: { id: user._id, fullName: user.fullName, email: user.email, btcAddress: user.btcAddress, balances: Object.fromEntries(user.balances) }});
  } catch (err) { next(err); }
});

/* --- PROFILE (Fixes Dashboard Error) --- */
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { fullName, phone }, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) { next(err); }
});

/* --- BALANCE & LEDGER --- */
router.get('/balance', protect, async (req, res, next) => {
  try {
    const cached = cache.get(req.user.id);
    if (cached) return res.json({ success: true, data: cached, source: 'cache' });

    const user = await User.findById(req.user.id).select('balances').lean();
    const b = user.balances || {};
    const balances = {
      BTC: (b instanceof Map ? b.get('BTC') : b.BTC) ?? 0,
      USD: (b instanceof Map ? b.get('USD') : b.USD) ?? 0,
      USDT: (b instanceof Map ? b.get('USDT') : b.USDT) ?? 0
    };
    cache.set(req.user.id, balances);
    res.json({ success: true, data: balances, source: 'db' });
  } catch (err) { next(err); }
});

router.get('/transactions/my', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    res.json({ success: true, data: user.ledger.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) { next(err); }
});

export default router;

