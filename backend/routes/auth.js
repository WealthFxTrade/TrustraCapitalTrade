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
const generateToken = (id, role) =>
  jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

/* ---------------- OTP HELPERS ---------------- */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashValue = (val) =>
  crypto.createHash('sha256').update(val).digest('hex');

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone)
      throw new ApiError(400, 'Full name, email, phone, and password are required');

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true }
    );

    const btcIndex = counterDoc.btcIndexCounter;
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, btcIndex);

    const newUser = await User.create({
      fullName,
      email: emailLower,
      phone,
      password,
      role: 'user',
      btcIndex,
      btcAddress,
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
        phone: newUser.phone,
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

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      throw new ApiError(401, 'Invalid credentials');

    if (user.banned) throw new ApiError(403, 'Account suspended');

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
        balances: Object.fromEntries(user.balances),
        plan: user.plan,
        isPlanActive: user.isPlanActive
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- FORGOT PASSWORD (SMS OTP) ---------------- */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, 'Phone is required');

    const user = await User.findOne({ phone });

    if (!user) {
      return res.json({
        success: true,
        message: 'If account exists, OTP sent'
      });
    }

    const otp = generateOtp();

    user.resetOtp = hashValue(otp);
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    user.resetOtpResendAt = Date.now() + 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendSms(
      user.phone,
      `Your password reset OTP is ${otp}. Valid for 10 minutes.`
    );

    res.json({ success: true, message: 'OTP sent via SMS' });
  } catch (err) {
    next(err);
  }
});

/* ---------------- RESEND RESET OTP ---------------- */
router.post('/resend-reset-otp', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, 'Phone is required');

    const user = await User.findOne({ phone });

    if (!user) {
      return res.json({
        success: true,
        message: 'If account exists, OTP resent'
      });
    }

    if (user.resetOtpResendAt && user.resetOtpResendAt > Date.now())
      throw new ApiError(429, 'Please wait before requesting another OTP');

    const otp = generateOtp();

    user.resetOtp = hashValue(otp);
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    user.resetOtpResendAt = Date.now() + 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendSms(user.phone, `Your password reset OTP is ${otp}.`);

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    next(err);
  }
});

/* ---------------- RESET PASSWORD (OTP + AUTO LOGIN) ---------------- */
router.post('/reset-password-otp', async (req, res, next) => {
  try {
    const { phone, otp, password } = req.body;

    if (!phone || !otp || !password)
      throw new ApiError(400, 'Phone, OTP, and new password are required');

    const user = await User.findOne({
      phone,
      resetOtp: hashValue(otp),
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, 'Invalid or expired OTP');

    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpResendAt = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- BALANCE ---------------- */
router.get('/balance', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cached = cache.get(userId);

    if (cached)
      return res.json({ success: true, data: cached, source: 'cache' });

    const user = await User.findById(userId).select('balances');
    if (!user) throw new ApiError(404, 'User not found');

    const balances = {
      BTC: user.balances?.get('BTC') ?? 0,
      EUR: user.balances?.get('EUR') ?? 0,
      USDT: user.balances?.get('USDT') ?? 0
    };

    cache.set(userId, balances);
    res.json({ success: true, data: balances, source: 'db' });
  } catch (err) {
    next(err);
  }
});

export default router;
