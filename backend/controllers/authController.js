import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// 📧 Mailer Transporter Protocol
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { 
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS 
    }
  });

  await transporter.sendMail({
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  });
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 */
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Include password for verification
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);

    // Set cookie for browser-based security (Optional fallback)
    res.cookie('trustra_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token, // 🔑 Essential for your frontend api.js interceptor
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user', // Needed for AuthContext redirection
        balances: Object.fromEntries(user.balances || new Map()),
        activePlan: user.activePlan || 'none'
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

/**
 * @desc    Register a new node
 * @route   POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User node already exists in registry');
  }

  const user = await User.create({ username, email, password });

  if (user) {
    res.status(201).json({ 
      success: true, 
      message: "Node registered successfully" 
    });
  }
});

/**
 * @desc    Clear session
 * @route   POST /api/auth/logout
 */
export const logoutUser = (req, res) => {
  res.cookie('trustra_token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Node logged out' });
};

/**
 * @desc    Get user profile (Used by initAuth in frontend)
 * @route   GET /api/auth/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        balances: Object.fromEntries(user.balances || new Map()),
        totalBalance: user.totalBalance,
        activePlan: user.activePlan
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Initialize Password Reset
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('Email not found'); }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Trustra Capital - Password Reset',
      html: `<h3>Reset Link:</h3><p>Use the link below to reset your secure key:</p><a href="${resetUrl}">${resetUrl}</a>`
    });
    res.status(200).json({ success: true, data: 'Protocol email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500); throw new Error('Email delivery failed');
  }
});

/**
 * @desc    Commit Password Reset
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.resettoken || req.body.token).digest('hex');
  const user = await User.findOne({ 
    resetPasswordToken: hashedToken, 
    resetPasswordExpire: { $gt: Date.now() } 
  });

  if (!user) { res.status(400); throw new Error('Invalid or expired token'); }
  
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

