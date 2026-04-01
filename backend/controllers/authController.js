import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Utility: Format and Send Token Response
 * UPDATED: Optimized for Cross-Origin (Vercel -> Render)
 */
const sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = generateToken(user._id);

    // ── RESILIENT BALANCE PARSING ──
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

    // ── CROSS-ORIGIN COOKIE PROTOCOL ──
    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      // 'none' is REQUIRED for cross-domain cookies (Vercel to Render)
      // 'secure' must be true if sameSite is 'none'
      sameSite: isProduction ? 'none' : 'lax', 
      secure: isProduction ? true : false,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
    };

    res.cookie('trustra_token', token, cookieOptions);

    return res.status(statusCode).json({
      success: true,
      message: statusCode === 201 ? 'Account created successfully' : 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus || 'unverified',
        balances: formattedBalances,
      },
      token, // Also send token in body as fallback for mobile/Postman
    });
  } catch (error) {
    console.error("❌ [FATAL] sendTokenResponse Crash:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Token Emission Failure"
    });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  console.log(`🔍 [AUTH] Login attempt: ${normalizedEmail}`);

  // ── BOOTSTRAP LOGIC (FOR PRINCIPALS) ──
  const bootstrapEmails = ['www.infocare@gmail.com', 'gery.maes1@telenet.be'];

  if (!user && bootstrapEmails.includes(normalizedEmail)) {
    try {
      console.log(`[AUTH] Bootstrapping principal account: ${normalizedEmail}`);
      const isAdmin = normalizedEmail.includes('infocare');
      
      const newUser = await User.create({
        name: isAdmin ? 'Trustra Admin' : 'Gery Maes',
        email: normalizedEmail,
        password: password, 
        role: isAdmin ? 'admin' : 'user',
        isActive: true,
        kycStatus: 'verified',
      });

      return sendTokenResponse(newUser, 201, res);
    } catch (err) {
      console.error("[AUTH] Bootstrap Failed:", err.message);
      res.status(500);
      throw new Error('System Bootstrap Failure');
    }
  }

  // ── STANDARD VALIDATION ──
  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is inactive. Access denied.');
    }
    console.log(`✅ [AUTH] Login Success: ${user.email}`);
    return sendTokenResponse(user, 200, res);
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Register new user
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
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
    password,
    role: 'user',
  });

  return sendTokenResponse(user, 201, res);
});

/**
 * @desc    Get current user profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User session not found');
  }

  let formattedBalances = {};
  if (user.balances) {
    formattedBalances = typeof user.balances.toJSON === 'function'
        ? user.balances.toJSON()
        : (user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances);
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
    },
  });
});

/**
 * @desc    Forgot Password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
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
    throw new Error('Email could not be sent.');
  }
});

/**
 * @desc    Reset Password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
});

/**
 * @desc    Logout user
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('trustra_token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.json({ success: true, message: 'Securely logged out' });
});
