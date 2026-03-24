import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Mailer transporter
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
    from: `\( {process.env.FROM_NAME || 'Trustra'} < \){process.env.FROM_EMAIL}>`,
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

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }

  const cleanEmail = email.toLowerCase().trim();

  // Get user with password field included
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Direct bcrypt comparison (more reliable)
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const token = generateToken(user._id);

    // Set httpOnly cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('trustra_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        balances: user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances || {},
        activePlan: user.activePlan || 'none'
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Register a new node
 * @route   POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password || !username) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const cleanEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: cleanEmail });

  if (userExists) {
    res.status(400);
    throw new Error('User node already exists in registry');
  }

  const user = await User.create({
    username: username.trim(),
    email: cleanEmail,
    password
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: "Node registered successfully"
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const logoutUser = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('trustra_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Node logged out' });
};

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        balances: user.balances instanceof Map ? Object.fromEntries(user.balances) : user.balances || {},
        totalBalance: user.totalBalance || 0,
        activePlan: user.activePlan || 'none'
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('Email not found in registry');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `\( {process.env.FRONTEND_URL}/reset-password/ \){resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Trustra Capital - Password Reset Protocol',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #EAB308;">Security Protocol: Password Reset</h2>
          <p>You requested a reset of your Zurich Node access credentials.</p>
          <a href="${resetUrl}" style="background: #EAB308; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Reset Credentials</a>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">This link expires in 10 minutes.</p>
        </div>
      `
    });
    res.status(200).json({ success: true, message: 'Protocol email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email delivery failed');
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.resettoken || req.body.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired security token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Node credentials updated successfully' });
});
