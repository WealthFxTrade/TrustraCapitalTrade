import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * 🔵 LOGIN USER (Fintech-Grade Secure Node Handshake)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Basic Input Validation
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    const emailLower = email.toLowerCase().trim();

    // 2️⃣ Find User (Exclude System Counter Documents)
    const user = await User.findOne({
      email: emailLower,
      isCounter: { $ne: true }
    }).select('+password');

    // 3️⃣ Timing Normalization to Prevent Enumeration
    if (!user) {
      await new Promise(r => setTimeout(r, 300));
      throw new ApiError(401, 'Invalid credentials');
    }

    // 4️⃣ Check Banned / Inactive
    if (user.banned || user.isActive === false) {
      throw new ApiError(403, 'Account suspended. Contact Trustra Support.');
    }

    // 5️⃣ Brute-Force Lock Check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new ApiError(403, `Account locked. Retry in ${remaining} minutes.`);
    }

    // 6️⃣ Verify Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15-minute lock
      }

      await user.save({ validateBeforeSave: false });
      throw new ApiError(401, 'Invalid credentials');
    }

    // 7️⃣ Reset Security Flags on Successful Login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();

    await user.save({ validateBeforeSave: false });

    // 8️⃣ JWT Token Generation
    if (!process.env.JWT_SECRET) {
      throw new Error('SECURE_VAULT_ERROR: JWT_SECRET missing');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // Compatible with middleware
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    // 9️⃣ Return Normalized User Response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        btcAddress: user.btcAddress || null,
        balances: Object.fromEntries(user.balances || new Map())
      }
    });

  } catch (err) {
    next(err);
  }
};
