import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Generate JWT Token
 * @param   {string} userId
 * @returns {string} token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
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

  // Pre-save hook in User.js handles password hashing
  const user = await User.create({
    name,
    email,
    password,
    balances: new Map([
      ['EUR', 0],
      ['BTC', 0],
      ['USDT', 0],
      ['ROI', 0],
      ['INVESTED', 0],
    ]),
  });

  const token = generateToken(user._id);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Select '+password' because it is hidden by default in the Schema
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked && user.isLocked()) {
    throw new ApiError(403, 'Account temporarily locked. Please try again later.');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    if (user.incrementFailedLogin) await user.incrementFailedLogin();
    throw new ApiError(401, 'Invalid credentials');
  }

  // Success: Reset failed attempts
  if (user.resetFailedLogin) await user.resetFailedLogin();

  const token = generateToken(user._id);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      balances: Object.fromEntries(user.balances || new Map()),
    },
    token,
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      fullName: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      kycStatus: user.kycStatus,
      balances: Object.fromEntries(user.balances || new Map()),
    },
  });
});

/**
 * @desc    Update Identity Node (Profile Settings)
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'Identity Node not found');
  }

  // Map 'fullName' from frontend to 'name' in DB Schema
  if (req.body.fullName) user.name = req.body.fullName;
  
  // Ensure phoneNumber is updated (requires the field in models/User.js)
  if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;

  // Handle Security Protocol (Password) Updates
  if (req.body.newPassword) {
    user.password = req.body.newPassword;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Identity Node synchronized successfully',
    user: {
      id: updatedUser._id,
      fullName: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      balances: Object.fromEntries(updatedUser.balances || new Map()),
    },
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});
