// controllers/authController.js
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { sendTokenResponse } from '../utils/sendTokenResponse.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, name, email, password, activePlan } = req.body;

  // Support both firstName/lastName and combined name
  let fullName = name;
  if (!fullName && firstName && lastName) {
    fullName = `${firstName} ${lastName}`;
  }

  if (!fullName || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  const user = await User.create({
    name: fullName,
    email: normalizedEmail,
    password,
    role: 'user',
    activePlan: activePlan || 'Class III: Prime',
    isActive: true,
  });

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let formattedBalances = {};
  if (user.balances) {
    if (typeof user.balances.toJSON === 'function') {
      formattedBalances = user.balances.toJSON();
    } else if (user.balances instanceof Map) {
      formattedBalances = Object.fromEntries(user.balances);
    } else {
      formattedBalances = user.balances;
    }
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus || 'unverified',
      balances: formattedBalances,
      activePlan: user.activePlan || 'Class III: Prime',
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Please provide your email address');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If an account exists, a recovery email has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Trustra Capital - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Trustra Capital Trade • Institutional Crypto Investments</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If an account exists, a recovery email has been sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new ApiError(500, 'Failed to send recovery email. Please try again later.');
  }
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, 'Token and new password are required');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully' });
});
