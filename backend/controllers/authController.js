import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('[LOGIN ATTEMPT]', { email });

  // 1. Find user by email (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log('[LOGIN FAILED] User not found for email:', email);
    res.status(401);
    throw new Error('Invalid email or access cipher');
  }

  // 2. Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    console.log('[LOGIN FAILED] Incorrect password for:', email);
    res.status(401);
    throw new Error('Invalid email or access cipher');
  }

  // 3. Generate JWT
  const token = generateToken(user._id);

  // 4. Set secure httpOnly cookie
  res.cookie('trustra_token', token, {
    httpOnly: true,                    // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',                // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  console.log('[LOGIN SUCCESS]', {
    userId: user._id,
    email: user.email,
    username: user.username,
  });

  // 5. Send user data (no token in body – it's in cookie)
  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

/**
 * @desc    Register a new user / node + auto-login
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone } = req.body;

  console.log('[REGISTER ATTEMPT]', {
    name,
    username,
    email,
    hasPhone: !!phone,
  });

  // 1. Check for duplicate email
  const userExists = await User.findOne({ email });
  if (userExists) {
    console.log('[REGISTER FAILED] Duplicate email:', email);
    res.status(400);
    throw new Error('Identity already exists in Registry');
  }

  // 2. Check for duplicate username
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    console.log('[REGISTER FAILED] Duplicate username:', username);
    res.status(400);
    throw new Error('Username is already synchronized with another node');
  }

  // 3. Create user document
  let user;
  try {
    user = await User.create({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      phone: phone?.trim() || undefined,
      balances: {
        total: 0,
        active: 0,
        profit: 0,
      },
    });

    console.log('[USER CREATED SUCCESSFULLY]', {
      userId: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (dbError) {
    console.error('[USER CREATION FAILED]', {
      message: dbError.message,
      name: dbError.name,
      code: dbError.code,
      keyValue: dbError.keyValue,
      stack: dbError.stack?.split('\n').slice(0, 3).join('\n'),
    });

    res.status(500);
    throw new Error('Failed to initialize account – please try again later');
  }

  // 4. Generate JWT and auto-login via cookie
  const token = generateToken(user._id);

  res.cookie('trustra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // 5. Send user data (no token in body)
  res.status(201).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    balances: user.balances,
    activePlan: user.activePlan,
    totalProfit: user.totalProfit || 0,
    totalBalance: user.totalBalance || 0,
    kycStatus: user.kycStatus,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

/**
 * @desc    Logout user (clears cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = (req, res) => {
  // Clear the auth cookie
  res.clearCookie('trustra_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Session terminated successfully',
  });
};

/**
 * @desc    Request password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log('[FORGOT PASSWORD REQUEST]', { email });

  const user = await User.findOne({ email });
  if (!user) {
    console.log('[FORGOT PASSWORD] User not found:', email);
    res.status(404);
    throw new Error('Identity not found in Zurich Mainnet');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'SECURITY: Access Cipher Reset Protocol',
      message: `A request has been initiated to reset your Trustra Access Cipher. Your OTP is: ${otp}`,
      otp,
    });

    console.log('[PASSWORD RESET OTP SENT]', { email: user.email });

    res.json({
      success: true,
      message: 'Authorization code dispatched to registered email',
    });
  } catch (emailError) {
    console.error('[EMAIL SEND FAILURE]', {
      email: user.email,
      error: emailError.message,
    });

    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(500);
    throw new Error('Email delivery system failure – please try again later');
  }
});

/**
 * @desc    Reset password using OTP
 * @route   PUT /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  console.log('[RESET PASSWORD ATTEMPT]', { email });

  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    console.log('[RESET PASSWORD FAILED] Invalid or expired OTP for:', email);
    res.status(400);
    throw new Error('Invalid or expired authorization code');
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  console.log('[PASSWORD RESET SUCCESS]', { email });

  res.json({
    success: true,
    message: 'Access Cipher updated successfully',
  });
});
