// backend/controllers/authController.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

const GENERIC_AUTH_ERROR = 'Invalid email or access token.';

/** Generate JWT */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, version: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/** Set Secure Cookie */
const setSecureAuthCookie = (res, token) => {
  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/* ====================== AUTHORIZE SESSION (New) ====================== */
export const authorizeSession = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR });
  }

  if (!user.isActive || user.isBanned) {
    return res.status(401).json({ success: false, message: 'Account is inactive or banned.' });
  }

  res.json({
    success: true,
    message: 'Session authorization successful',
    email: user.email,
    requiresPassword: true,
  });
});

/* ====================== ESTABLISH SESSION (New) ====================== */
export const establishSession = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and access token are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    const dummy = new User();
    await dummy.matchPassword('dummy').catch(() => {});
    return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR });
  }

  if (!user.isActive || user.isBanned) {
    return res.status(401).json({ success: false, message: 'Account is inactive or banned.' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: GENERIC_AUTH_ERROR });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);
  setSecureAuthCookie(res, token);

  res.json({
    success: true,
    message: 'Secure encrypted session established',
    token,
    user: user.getPublicProfile(),
  });
});

/* ====================== VERIFY SESSION ====================== */
export const verifySession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid session' });

  res.json({
    success: true,
    valid: true,
    user: user.getPublicProfile(),
  });
});

/* ====================== EXISTING FUNCTIONS (unchanged) ====================== */
export const registerUser = asyncHandler(async (req, res) => {
  // ... your existing register code (unchanged)
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    return res.status(400).json({ success: false, message: 'Registration processing error. Please contact support.' });
  }

  const lastUser = await User.findOne().sort({ address_index: -1 });
  const nextIndex = lastUser?.address_index !== undefined ? lastUser.address_index + 1 : 0;
  const { address } = deriveBtcAddress(nextIndex);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    address_index: nextIndex,
    balances: {
      EUR: 0, BTC: 0, ETH: 0, USDT: 0,
      LOCKED_EUR: 0, LOCKED_BTC: 0, LOCKED_ETH: 0, LOCKED_USDT: 0,
      INVESTED: 0, TOTAL_PROFIT: 0,
    },
    walletAddresses: { BTC: address, ETH: '', USDT: '' },
  });

  const token = generateToken(user);
  setSecureAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.getPublicProfile(),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  // Keep your existing login (optional fallback)
  // ... your existing loginUser code
});

export const getUserProfile = asyncHandler(async (req, res) => { /* existing */ });
export const updateUserProfile = asyncHandler(async (req, res) => { /* existing */ });
export const logoutUser = asyncHandler(async (req, res) => { /* existing */ });
export const forgotPassword = asyncHandler(async (req, res) => { /* existing */ });
export const resetPassword = asyncHandler(async (req, res) => { /* existing */ });
export const refreshSession = asyncHandler(async (req, res) => { /* existing */ });
