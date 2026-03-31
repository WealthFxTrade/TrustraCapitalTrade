/**
 * Trustra Capital Trade - Authentication Controller
 * PRODUCTION READY - High Security & Scalability
 */
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Utility: Send token via cookie and JSON response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('trustra_token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? 'Account created successfully' : 'Login successful',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus || 'unverified',
      balances: Object.fromEntries(user.balances || new Map()),
    },
    token,
  });
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail }).select('+password');

  // ── PRODUCTION BOOTSTRAP LOGIC ──
  // Automatically creates these specific accounts if they don't exist in a new DB
  const bootstrapEmails = ['www.infocare@gmail.com', 'gery.maes1@telenet.be'];
  
  if (!user && bootstrapEmails.includes(normalizedEmail)) {
    console.log(`[AUTH] Bootstrapping production account: ${normalizedEmail}`);
    user = await User.create({
      name: normalizedEmail.includes('infocare') ? 'Trustra Admin' : 'Gery Maes',
      email: normalizedEmail,
      password: password, // This will be hashed by the User model's pre-save hook
      role: normalizedEmail.includes('infocare') ? 'admin' : 'user',
      isActive: true,
      kycStatus: 'verified',
    });
    return sendTokenResponse(user, 201, res);
  }

  // ── STANDARD VALIDATION ──
  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is inactive. Please contact support.');
    }

    if (user.isBanned) {
      res.status(403);
      throw new Error('Account has been suspended.');
    }

    return sendTokenResponse(user, 200, res);
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Register new user
 * @route   POST /auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('All registration fields are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email: normalizedEmail,
    password, // Hashed automatically by User model
    role: 'user',
  });

  if (user) {
    sendTokenResponse(user, 201, res);
  } else {
    res.status(400);
    throw new Error('Invalid registration data provided');
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /auth/profile
 * @access  Private (Requires Protect Middleware)
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User session not found');
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus || 'unverified',
      balances: Object.fromEntries(user.balances || new Map()),
    },
  });
});

/**
 * @desc    Forgot Password - Send recovery link
 * @route   POST /auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 Hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Trustra Capital - Password Reset Request',
      html: `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });
    res.json({ success: true, message: 'Recovery email sent successfully.' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Reset Password using token
 * @route   POST /auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password; // Hashed by User model pre-save
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
});

/**
 * @desc    Logout user & clear cookie
 * @route   POST /auth/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: 'Securely logged out'
  });
});

