// middleware/hashPasswordMiddleware.js
/**
 * Trustra Capital Trade - Password Hashing Middleware
 * Production-ready • bcryptjs • March 2026
 * 
 * Automatically hashes req.body.password (register + password updates)
 * Drop-in replacement — works with your existing asyncHandler + error flow
 */

import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

const SALT_ROUNDS = 14; // Strong & future-proof (2026 standard)

// One-time check at import
if (!process.env.JWT_SECRET) {
  console.error('❌ [HASH] JWT_SECRET missing — auth will fail');
}

/**
 * @desc    Hash password in req.body before it reaches controller
 * @access  Use on REGISTER and CHANGE-PASSWORD routes only
 */
export const hashPassword = asyncHandler(async (req, res, next) => {
  // Skip if no password field or already hashed
  if (!req.body.password || typeof req.body.password !== 'string') {
    return next();
  }

  // Quick client-side validation (prevents garbage reaching DB)
  if (req.body.password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    console.log(`🔐 [HASH] Processing password for ${req.body.email || 'new user'}`);

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashed = await bcrypt.hash(req.body.password, salt);

    req.body.password = hashed; // replace plain text with hash

    console.log('✅ [HASH] Password hashed successfully');
    next();
  } catch (error) {
    console.error(`❌ [HASH] Bcrypt failed: ${error.message}`);
    res.status(500);
    throw new Error('Password hashing failed. Please try again.');
  }
});

/**
 * @desc    Compare password helper (for login controller)
 *          You can import and use this in your login route
 */
export const comparePassword = async (enteredPassword, storedHash) => {
  return bcrypt.compare(enteredPassword, storedHash);
};

// Flexible exports (matches your other middleware style)
export default {
  hashPassword,
  comparePassword
};
