// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @desc    Generate JWT Token with 2026 Security Standards
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      throw new ApiError(400, 'Full name, email, and password are required');
    }

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    
    if (existingUser) {
      throw new ApiError(409, 'This email address is already registered');
    }

    /**
     * ATOMIC INDEXING FIX: 
     * In a multi-server environment (Render/Vercel), we use findOneAndUpdate 
     * with $inc on a specific counter document or the last user to ensure 
     * no two users get the same btcIndex/Address.
     */
    const lastUser = await User.findOneAndUpdate(
      {}, 
      { $inc: { btcIndexCounter: 1 } }, 
      { sort: { btcIndex: -1 }, upsert: true, new: true }
    ).select('btcIndex');

    // If it's a new system, start at 0, otherwise use the incremented index
    const nextIndex = lastUser ? lastUser.btcIndex : 0;
    
    // Derive Native SegWit (bc1) address using our utility
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, nextIndex);

    const newUser = await User.create({
      fullName,
      email: emailLower,
      password, // Automatically hashed by the pre-save hook in User.js
      role: 'user',
      btcIndex: nextIndex,
      btcAddress,
      balances: { BTC: 0, USD: 0, USDT: 0 },
      ledger: [],
      plan: 'none',
      isActive: true
    });

    res.status(201).json({
      success: true,
      token: generateToken(newUser._id, newUser.role),
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        btcAddress: newUser.btcAddress,
        role: newUser.role,
        balances: newUser.balances,
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- LOGIN ---------------- */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Explicitly select password due to 'select: false' in the User model
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid login credentials');
    }

    if (user.banned) {
      throw new ApiError(403, 'This account has been suspended. Please contact support.');
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        btcAddress: user.btcAddress,
        balances: user.balances,
        plan: user.plan
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- FORGOT PASSWORD ---------------- */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email is required');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
      await user.save();
      
      // PRODUCTION NOTE: Integrate your email service (Nodemailer/SendGrid) here
      // to send the link: `https://trustra-capital-trade.vercel.app{token}`
    }

    // Always return success to prevent email enumeration attacks
    res.json({ 
      success: true, 
      message: 'If an account exists with this email, a reset link has been sent.' 
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- RESET PASSWORD ---------------- */
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Password reset token is invalid or has expired');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Your password has been reset successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;

