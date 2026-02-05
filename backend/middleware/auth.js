// /middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * @desc    Protect routes - Ensures user is authenticated via JWT
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in headers
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user from database (exclude password and ledger)
    req.user = await User.findById(decoded.id).select('-password -ledger');

    if (!req.user) {
      return next(new ApiError(401, 'User associated with this token no longer exists'));
    }

    // 4. Production security checks
    if (req.user.banned) {
      return next(new ApiError(403, 'Account has been suspended. Please contact support.'));
    }

    if (req.user.isActive === false) {
      return next(new ApiError(403, 'Account is inactive. Please verify your email.'));
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired, please login again'));
    }
    next(new ApiError(401, 'Not authorized, invalid token'));
  }
};

/**
 * @desc    Restrict access to Admin roles only
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ApiError(403, 'Access denied. Admin privileges required.'));
  }
};
