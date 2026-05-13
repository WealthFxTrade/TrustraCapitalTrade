// backend/controllers/authController.js

import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

/**
 * =========================
 * TOKEN GENERATION
 * =========================
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
 * =========================
 * BALANCE NORMALIZER
 * =========================
 */
const normalizeBalances = (balances) => {
  if (!balances) return {};

  if (typeof balances?.entries === 'function') {
    return Object.fromEntries(balances.entries());
  }

  if (typeof balances === 'object') {
    return { ...balances };
  }

  return {};
};

/**
 * =========================
 * REGISTER USER
 * =========================
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists',
    });
  }

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
    walletAddresses: new Map([['BTC', address]]),
  });

  const token = generateToken(user);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
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
 * =========================
 * LOGIN USER (FIXED FOR PRODUCTION)
 * =========================
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = generateToken(user);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: 'Login successful',
    token,
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
 * =========================
 * REFRESH SESSION
 * =========================
 */
export const refreshSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Session expired',
    });
  }

  const token = generateToken(user);

  return res.json({
    success: true,
    token,
  });
});

/**
 * =========================
 * GET PROFILE
 * =========================
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.json({
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
 * =========================
 * UPDATE PROFILE
 * =========================
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (req.body.name) user.name = req.body.name;

  if (req.body.password) {
    user.password = req.body.password;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }

  const updatedUser = await user.save();

  const token = generateToken(updatedUser);

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    token,
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      balances: normalizeBalances(updatedUser.balances),
    },
  });
});

/**
 * =========================
 * FORGOT PASSWORD
 * =========================
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  return res.json({
    success: true,
    message: 'Reset token generated',
    resetToken,
  });
});

/**
 * =========================
 * RESET PASSWORD
 * =========================
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  await user.save();

  const token = generateToken(user);

  return res.json({
    success: true,
    message: 'Password reset successful',
    token,
  });
});

/**
 * =========================
 * LOGOUT
 * =========================
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
