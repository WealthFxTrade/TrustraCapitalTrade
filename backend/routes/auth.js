import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { sendSms } from '../utils/sendSms.js';

const router = express.Router();

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      throw new ApiError(400, 'All fields are required');
    }

    // 1. Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) throw new ApiError(409, 'Email already in use');

    // 2. Atomic increment of BTC counter (Upsert creates it if it doesn't exist)
    const counter = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, counter.btcIndexCounter);

    // 3. Create User
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      btcIndex: counter.btcIndexCounter,
      btcAddress,
      isCounter: false
    });

    res.status(201).json({
      success: true,
      token: generateToken(newUser._id, newUser.role),
      user: { id: newUser._id, email: newUser.email, btcAddress: newUser.btcAddress }
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

    // FIX: Filter out the counter document to avoid "Invalid Credentials" on valid users
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isCounter: { $ne: true } 
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.banned) throw new ApiError(403, 'Account suspended');

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        balances: user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

