import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { protect } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import NodeCache from 'node-cache';
import { sendSms } from '../utils/sendSms.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const cache = new NodeCache({ stdTTL: 60 });

/* ---------------- UTILITY: Generate JWT ---------------- */
const generateToken = (id, role) => {
  if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing from environment variables");
  }
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/* ---------------- OTP HELPERS ---------------- */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashValue = (val) =>
  crypto.createHash('sha256').update(val).digest('hex');

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validation
    if (!fullName || !email || !password || !phone) {
      throw new ApiError(400, 'All fields (name, email, phone, password) are required');
    }

    const emailLower = email.toLowerCase().trim();
    
    // 2. Check existence
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    // 3. BTC Address Derivation logic
    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true }
    );

    const btcIndex = counterDoc.btcIndexCounter;
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, btcIndex);

    // 4. Create User
    const newUser = await User.create({
      fullName,
      email: emailLower,
      phone: phone.trim(),
      password, // Password hashing happens in the User Model middleware
      role: 'user',
      btcIndex,
      btcAddress,
      balances: {
        BTC: 0,
        EUR: 0,
        USDT: 0
      },
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
        phone: newUser.phone,
        btcAddress: newUser.btcAddress,
        role: newUser.role,
        balances: newUser.balances
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

    // 1. Check for missing fields to prevent .toLowerCase() crashes
    if (!email || !password) {
      throw new ApiError(400, 'Please provide both email and password');
    }

    // 2. Find user & include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    // 3. Verify user and password
    // NOTE: Requires 'comparePassword' method in your User Model
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // 4. Check status
    if (user.banned) throw new ApiError(403, 'Account suspended. Contact support.');

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        btcAddress: user.btcAddress,
        balances: user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances,
        plan: user.plan,
        isPlanActive: user.isPlanActive
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- FORGOT PASSWORD ---------------- */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, 'Phone number is required');

    const user = await User.findOne({ phone: phone.trim() });

    // Privacy security: don't reveal if user exists or not
    if (!user) {
      return res.json({ success: true, message: 'If account exists, OTP sent' });
    }

    const otp = generateOtp();
    user.resetOtp = hashValue(otp);
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    user.resetOtpResendAt = Date.now() + 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    await sendSms(user.phone, `Your Trustra reset OTP is ${otp}. Valid for 10 mins.`);

    res.json({ success: true, message: 'OTP sent via SMS' });
  } catch (err) {
    next(err);
  }
});

/* ---------------- RESET PASSWORD ---------------- */
router.post('/reset-password-otp', async (req, res, next) => {
  try {
    const { phone, otp, password } = req.body;

    if (!phone || !otp || !password)
      throw new ApiError(400, 'Phone, OTP, and new password are required');

    const user = await User.findOne({
      phone: phone.trim(),
      resetOtp: hashValue(otp),
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, 'Invalid or expired OTP');

    // Update password (Model pre-save hook will hash this)
    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpResendAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login.',
      token: generateToken(user._id, user.role) // Optional: Auto-login
    });
  } catch (err) {
    next(err);
  }
});

export default router;

