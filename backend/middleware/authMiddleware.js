// middleware/authMiddleware.js
/**
 * Trustra Capital Trade - Authentication Middleware
 * Optimized: March 2026
 * - JWT_SECRET checked once at startup
 * - Lean queries for 2-3x faster DB lookup
 * - Cleaner error flow + consistent logging
 * - No unnecessary checks on every request
 */

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// One-time JWT_SECRET validation (fails fast at startup)
if (!process.env.JWT_SECRET) {
  console.error('❌ [AUTH] Critical: JWT_SECRET is missing from .env');
  process.exit(1); // Hard fail on startup — better than runtime errors
}

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Prefer httpOnly cookie (most secure for web/SPA)
  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  }
  // 2. Fallback for mobile/Postman/API clients
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn(`[AUTH] No token → \( {req.method} \){req.originalUrl}`);
    res.status(401);
    throw new Error('Not authorized - No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized - Invalid token payload');
    }

    // Fast DB lookup: .lean() removes Mongoose overhead
    const user = await User.findById(userId)
      .select('-password -__v') // exclude sensitive + version fields
      .lean();                  // 2-3x faster, plain JS object

    if (!user) {
      console.error(`[AUTH] Token valid but user ${userId} not found`);
      res.status(401);
      throw new Error('Not authorized - User not found');
    }

    // Account status checks
    if (user.isBanned) {
      res.status(403);
      throw new Error('Account has been banned. Please contact support.');
    }

    if (user.isActive === false) {
      res.status(403);
      throw new Error('Account is inactive. Please contact the system administrator.');
    }

    // Attach clean user object to request
    req.user = user;
    next();
  } catch (error) {
    let message = 'Not authorized - Invalid session';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again';
      console.warn('[AUTH] Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token signature';
      console.error('[AUTH] JWT signature failed — check JWT_SECRET');
    } else {
      console.error(`[AUTH] Verification error: ${error.message}`);
    }

    res.status(401);
    throw new Error(message);
  }
});

/**
 * @desc    Admin-only middleware
 * @access  Private (Admin / Superadmin)
 */
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }

  console.warn(`[AUTH] Admin access denied for user: ${req.user?.email || 'unknown'}`);
  res.status(403);
  throw new Error('Access denied - Administrative privileges required');
};

// Export both individually and as default (flexible usage)
export { protect, admin };
export default { protect, admin };
