// backend/controllers/authController.js

import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

/**
 * ============================================================================
 * GLOBAL SECURITY STRINGS & DEFINITIONS
 * ============================================================================
 */
const GENERIC_AUTH_ERROR = 'Invalid email or access token.';
const GENERIC_FORGOT_ERROR = 'If that account exists, a reset link has been processed.';

/**
 * ============================================================================
 * PRIVATE HELPERS
 * ============================================================================
 */

/**
 * Generates a signed JSON Web Token for user session states
 * @param {Object} user - The mongoose user document instance
 * @returns {String} Signed JWT token string
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
 * Normalizes user account balance mappings safely across schema structures
 * @param {Map|Object} balances - Mongoose map layer or raw object data
 * @returns {Object} Cleaned key-value mapping of balances
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
 * Configures cookie security descriptors consistently across execution paths
 * Resolves the cross-origin pipeline limitations between Render and Vercel
 * @param {Object} res - Express response instance layer
 * @param {String} token - Generated session JWT token
 */
const setSecureAuthCookie = (res, token) => {
  res.cookie('trustra_token', token, {
    httpOnly: true, // Defeats client-side Cross-Site Scripting (XSS) token theft
    secure: true,   // Mandates HTTPS execution context (Required by Render and Vercel)
    sameSite: 'none', // Required for Cross-Origin resource contexts across different provider domains
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days lifespan window
  });
};

/**
 * ============================================================================
 * PUBLIC CONTROLLERS
 * ============================================================================
 */

/**
 * @desc    Register a new institutional profile
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  // PRODUCTION SECURITY FIX: Obfuscates account checks to block systematic user mapping
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Registration processing error. Please contact corporate support.',
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
    email: normalizedEmail,
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
  setSecureAuthCookie(res, token);

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
 * @desc    Authenticate platform user & issue session token cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  // PRODUCTION SECURITY FIX: Anti-Timing Attack Vector Control
  // If user profile is missing, run a simulated password verification cycle
  // This causes the endpoint processing latency to match a real user logic trace
  if (!user) {
    const dummyUser = new User();
    await dummyUser.matchPassword('dummy_verification_string_value');
    
    return res.status(401).json({
      success: false,
      message: GENERIC_AUTH_ERROR,
    });
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: GENERIC_AUTH_ERROR,
    });
  }

  const token = generateToken(user);
  setSecureAuthCookie(res, token);

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
 * @desc    Refresh existing active session tokens
 * @route   GET /api/auth/refresh
 * @access  Private
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
  setSecureAuthCookie(res, token);

  return res.json({
    success: true,
    token,
  });
});

/**
 * @desc    Fetch target profile details
 * @route   GET /api/auth/profile
 * @access  Private
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
 * @desc    Update profile attributes safely
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (req.body.name) {
    user.name = req.body.name;
  }

  // If password changes, increment token version to log out other existing sessions
  if (req.body.password) {
    user.password = req.body.password;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }

  const updatedUser = await user.save();
  const token = generateToken(updatedUser);
  setSecureAuthCookie(res, token);

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
 * @desc    Initialize password retrieval token loop
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: 'Email field is required',
    });
  }

  const normalizedEmail = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // PRODUCTION SECURITY FIX: Never disclose to outside consumers if an account exists or not
  if (!user) {
    return res.json({
      success: true,
      message: GENERIC_FORGOT_ERROR,
    });
  }

  // Calls the schema configuration method hook to generate a safe token payload tracking string
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // NOTE: Integrate your system mail service provider layout loop here (e.g. NodeMailer / SendGrid)
  // Example pipeline execution:
  // await sendProductionResetEmail({ email: user.email, token: resetToken });

  return res.json({
    success: true,
    message: GENERIC_FORGOT_ERROR,
    // Safely hide the string when running in a strict live web target deployment environment
    resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
  });
});

/**
 * @desc    Validate profile state resets
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  if (!req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'New password value is required',
    });
  }

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
      message: 'Invalid or expired token payload structure.',
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;

  await user.save();

  const token = generateToken(user);
  setSecureAuthCookie(res, token);

  return res.json({
    success: true,
    message: 'Password reset successful',
    token,
  });
});

/**
 * @desc    Terminate active profile authorization status and flush local auth cookies
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0), // Sets token date history into past states, wiping local clients instantly
    path: '/',
  });

  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

