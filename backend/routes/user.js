import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import NodeCache from 'node-cache';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { protect } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 });

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/* --- AUTH --- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const lastUser = await User.findOneAndUpdate({}, { $inc: { btcIndexCounter: 1 } }, { sort: { btcIndex: -1 }, upsert: true, new: true });
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, lastUser.btcIndex);

    const newUser = await User.create({
      fullName, email: email.toLowerCase(), password, btcIndex: lastUser.btcIndex, btcAddress,
      balances: new Map([['BTC', 0], ['USD', 0], ['USDT', 0]])
    });

    res.status(201).json({ success: true, token: generateToken(newUser._id, newUser.role), user: newUser });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
    res.json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (err) { next(err); }
});

/* --- PROFILE & BALANCE --- */
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

router.patch('/profile', protect, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { fullName, phone }, { new: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

router.get('/balance', protect, async (req, res, next) => {
  try {
    const cached = cache.get(req.user.id);
    if (cached) return res.json({ success: true, data: cached });

    const user = await User.findById(req.user.id).select('balances').lean();
    const b = user.balances || {};
    const data = {
      BTC: (b instanceof Map ? b.get('BTC') : b.BTC) ?? 0,
      USD: (b instanceof Map ? b.get('USD') : b.USD) ?? 0,
      USDT: (b instanceof Map ? b.get('USDT') : b.USDT) ?? 0
    };
    cache.set(req.user.id, data);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/* --- LEDGER --- */
router.get('/transactions/my', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    res.json({ success: true, data: user.ledger.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) { next(err); }
});

export default router;

