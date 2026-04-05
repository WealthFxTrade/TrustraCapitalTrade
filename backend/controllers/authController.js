import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, 'User already exists');

  // NOTE: You don't actually need to manually hash here if your 
  // User.js pre-save hook is active, but it doesn't hurt.
  const user = await User.create({
    name,
    email,
    password, 
    balances: new Map([
      ['EUR', 0],
      ['ROI', 0],
      ['INVESTED', 0],
      ['BTC', 0],
      ['USDT', 0],
    ]),
  });

  const token = generateToken(user._id);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' is better for cross-domain production
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(201).json({
    success: true,
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role 
    },
    token,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  // ── THE FIX ──
  // Explicitly select '+password' because the model hides it by default
  const user = await User.findOne({ email }).select('+password');

  if (!user) throw new ApiError(401, 'Invalid credentials');

  // Use the matchPassword method from your User model
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    // Optional: trigger your lockout logic here
    if (user.incrementFailedLogin) await user.incrementFailedLogin();
    throw new ApiError(401, 'Invalid credentials');
  }

  // Reset failed attempts on successful login
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
      balances: Object.fromEntries(user.balances || new Map())
    },
    token,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the 'protect' middleware
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      balances: Object.fromEntries(user.balances || new Map()),
    },
  });
});
