import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

/**
 * ─────────────────────────────
 * 🔐 TOKEN GENERATION
 * ─────────────────────────────
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      version: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * ─────────────────────────────
 * 🧠 SAFE BALANCE NORMALIZER
 * Fixes Map/Object inconsistency
 * ─────────────────────────────
 */
const normalizeBalances = (balances) => {
  if (!balances) return {};

  // Case 1: Mongoose Map
  if (typeof balances.entries === 'function') {
    return Object.fromEntries(balances.entries());
  }

  // Case 2: Already plain object
  if (typeof balances === 'object') {
    return { ...balances };
  }

  return {};
};

/**
 * ─────────────────────────────
 * 📝 REGISTER USER
 * ─────────────────────────────
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  // HD wallet index
  const lastUser = await User.findOne().sort({ address_index: -1 });
  const nextIndex =
    lastUser && lastUser.address_index !== undefined
      ? lastUser.address_index + 1
      : 0;

  const { address } = deriveBtcAddress(nextIndex);

  const user = await User.create({
    name,
    email,
    password,
    address_index: nextIndex,
    tokenVersion: 0,
    balances: new Map([
      ['EUR', 0],
      ['BTC', 0],
      ['ETH', 0],
      ['USDT', 0],
      ['INVESTED', 0],
      ['TOTAL_PROFIT', 0],
    ]),
    walletAddresses: new Map([
      ['BTC', address],
    ]),
  });

  const token = generateToken(user);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      balances: normalizeBalances(user.balances),
      btcAddress: address,
    },
  });
});

/**
 * ─────────────────────────────
 * 🔑 LOGIN USER (FIXED)
 * ─────────────────────────────
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      balances: normalizeBalances(user.balances), // ✅ FIXED HERE
      kycStatus: user.kycStatus,
    },
  });
});

/**
 * ─────────────────────────────
 * 🔄 REFRESH SESSION
 * ─────────────────────────────
 */
export const refreshSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(401, 'Session revoked');

  const token = generateToken(user);

  res.json({ success: true, token });
});

/**
 * ─────────────────────────────
 * 👤 GET PROFILE
 * ─────────────────────────────
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'Profile not found');

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      balances: normalizeBalances(user.balances),
      kycStatus: user.kycStatus,
    },
  });
});

/**
 * ─────────────────────────────
 * ✏️ UPDATE PROFILE
 * ─────────────────────────────
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (req.body.name) user.name = req.body.name;

  if (req.body.password) {
    user.password = req.body.password;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }

  const updatedUser = await user.save();
  const token = generateToken(updatedUser);

  res.json({
    success: true,
    message: 'Profile updated',
    token,
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      balances: normalizeBalances(updatedUser.balances),
    },
  });
});

/**
 * ─────────────────────────────
 * 🔐 FORGOT PASSWORD
 * ─────────────────────────────
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) throw new ApiError(404, 'User not found');

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Reset token generated',
    resetToken,
  });
});

/**
 * ─────────────────────────────
 * 🔁 RESET PASSWORD
 * ─────────────────────────────
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Invalid or expired token');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  await user.save();

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Password updated',
    token,
  });
});

/**
 * ─────────────────────────────
 * 🚪 LOGOUT
 * ─────────────────────────────
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
