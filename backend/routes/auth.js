// routes/auth.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

/**
 * Utility: Format and send token response
 * Supports secure cookies for production and lax for local dev
 */
const sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = generateToken(user._id);

    // Serialize balances map if present
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

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    res.cookie('trustra_token', token, cookieOptions);

    return res.status(statusCode).json({
      success: true,
      message: statusCode === 201 ? 'Account created' : 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus || 'unverified',
        balances: formattedBalances,
        activePlan: user.activePlan || 'Standard Yield',
      },
      token,
    });
  } catch (err) {
    console.error('[AUTH ERROR] Response failure:', err.message);
    throw new ApiError(500, 'Auth Protocol Failure');
  }
};

/**
 * @desc Authenticate user & get token (Login)
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Please provide email and password');

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) throw new ApiError(403, 'Account is inactive. Access denied.');

    console.log(`[AUTH] Login success: ${user.email}`);
    sendTokenResponse(user, 200, res);
  })
);

/**
 * @desc Register new user
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      throw new ApiError(400, 'Please fill all required fields');

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) throw new ApiError(400, 'User already exists');

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email: normalizedEmail,
      password,
      role: 'user',
    });

    sendTokenResponse(user, 201, res);
  })
);

/**
 * @desc Get current user profile
 */
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) throw new ApiError(404, 'User session not found');

    let formattedBalances = {};
    if (user.balances) {
      formattedBalances =
        typeof user.balances.toJSON === 'function'
          ? user.balances.toJSON()
          : user.balances instanceof Map
          ? Object.fromEntries(user.balances)
          : user.balances;
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
        activePlan: user.activePlan,
      },
    });
  })
);

/**
 * @desc Forgot password - send reset email
 */
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return res.json({ success: true, message: 'Recovery email sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Trustra Capital - Password Reset',
        html: `<p>Reset your password <a href="${resetUrl}">here</a>. Link expires in 1 hour.</p>`,
      });
      res.json({ success: true, message: 'Recovery email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw new ApiError(500, 'Email failed');
    }
  })
);

/**
 * @desc Reset password
 */
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, 'Invalid or expired token');

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  })
);

/**
 * @desc Logout user
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('trustra_token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    res.json({ success: true, message: 'Logged out' });
  })
);

export default router;
