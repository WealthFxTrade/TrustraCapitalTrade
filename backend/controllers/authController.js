import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Utility: Format and Send Token Response
 * Optimized for local HTTP and Production HTTPS Handshakes
 */
const sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = generateToken(user._id);

    // ── BALANCE SERIALIZATION ──
    // Ensures Mongoose Map becomes a JSON Object (EUR: 125550)
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
      // 'lax' is required for Local HTTP (Termux). 'none' is for Production HTTPS.
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
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
        activePlan: user.activePlan || 'Standard Yield'
      },
      token,
    });
  } catch (error) {
    console.error("❌ [AUTH ERROR] Response Failure:", error.message);
    return res.status(500).json({ success: false, message: "Auth Protocol Failure" });
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

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is inactive. Access denied.');
    }
    console.log(`✅ [AUTH] Success: ${user.email}`);
    return sendTokenResponse(user, 200, res);
  } else {
    console.warn(`❌ [AUTH] Invalid credentials for ${normalizedEmail}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }
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
      activePlan: user.activePlan
    },
  });
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
    throw new Error('User already exists');
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
 * @desc    Forgot Password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) return res.json({ success: true, message: 'Recovery email sent' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Trustra Capital - Password Reset',
      html: `<p>Reset your password <a href="${resetUrl}">here</a>. Link expires in 1 hour.</p>`
    });
    res.json({ success: true, message: 'Recovery email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email failed');
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
    throw new Error('Invalid or expired token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password updated' });
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
  res.json({ success: true, message: 'Logged out' });
});
