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

/* ====================== REGISTER ====================== */
export const registerUser = asyncHandler(async (req, res) => {
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

/* ====================== LOGIN ====================== */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
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
    message: 'Login successful',
    token,
    user: user.getPublicProfile(),
  });
});

/* ====================== PROFILE ====================== */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, user: user.getPublicProfile() });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (req.body.name) user.name = req.body.name;
  if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;

  if (req.body.password) {
    user.password = req.body.password;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }

  const updatedUser = await user.save();
  const token = generateToken(updatedUser);
  setSecureAuthCookie(res, token);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    token,
    user: updatedUser.getPublicProfile(),
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

/* ====================== PASSWORD RESET ====================== */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.json({ success: true, message: 'If that account exists, a reset link has been processed.' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send email here later
  res.json({ success: true, message: 'If that account exists, a reset link has been processed.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'New password is required' });

  const resetTokenHash = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  await user.save();

  const token = generateToken(user);
  setSecureAuthCookie(res, token);

  res.json({ success: true, message: 'Password reset successful', token });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ success: false, message: 'Session expired' });

  const token = generateToken(user);
  setSecureAuthCookie(res, token);

  res.json({ success: true, token });
});
