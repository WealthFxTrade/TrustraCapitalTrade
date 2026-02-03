import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// JWT helper
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) throw new ApiError(400, 'Full name, email, and password are required');

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    // Generate BTC index & address
    const lastUser = await User.findOneAndUpdate(
      {},
      { $inc: { btcIndexCounter: 1 } },
      { sort: { btcIndex: -1 }, upsert: true, new: true }
    );
    const nextIndex = lastUser ? lastUser.btcIndex : 0;
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, nextIndex);

    const newUser = await User.create({
      fullName,
      email: emailLower,
      password, // hashed via pre-save hook
      role: 'user',
      btcIndex: nextIndex,
      btcAddress
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
        balances: newUser.balances
      }
    });
  } catch (err) { next(err); }
});

/* ---------------- LOGIN ---------------- */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
    if (user.banned) throw new ApiError(403, 'Account suspended');

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        btcAddress: user.btcAddress,
        role: user.role,
        balances: user.balances
      }
    });
  } catch (err) { next(err); }
});

/* ---------------- GET CURRENT USER ---------------- */
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        btcAddress: user.btcAddress,
        role: user.role,
        balances: user.balances
      }
    });
  } catch (err) { next(err); }
});

export default router;
