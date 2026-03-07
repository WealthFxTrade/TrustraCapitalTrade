import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 */
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or access cipher');
  }
});

/**
 * @desc    Register a new node (Signup)
 * @route   POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Identity already exists in Registry');
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      balances: Object.fromEntries(user.balances),
      activePlan: user.activePlan
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Logout user / Terminate Session
 * @route   POST /api/auth/logout
 */
export const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Session terminated' });
};

/**
 * @desc    Request Password Reset (OTP Dispatch)
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('Identity not found in Zurich Mainnet');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 Min
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'SECURITY: Access Cipher Reset Protocol',
      message: 'A request has been initiated to reset your Trustra Access Cipher.',
      otp: otp
    });
    res.json({ success: true, message: 'Authorization code dispatched' });
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email delivery failed');
  }
});

/**
 * @desc    Verify OTP and Update Password
 * @route   PUT /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired authorization code');
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Access Cipher updated successfully' });
});
