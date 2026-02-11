import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * @desc    Protect routes - Ensures user is authenticated via JWT
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Correctly split "Bearer <token>" and take the second part
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Validate token presence
    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    // 3. Verify token authenticity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Get user from DB (Exclude sensitive password/large ledger)
    // NOTE: In login we used .select('+password'), here we exclude it for safety
    const currentUser = await User.findById(decoded.id).select('-password -ledger');

    if (!currentUser) {
      throw new ApiError(401, 'The user belonging to this token no longer exists');
    }

    // 5. Production Security: Check Banned or Inactive status
    if (currentUser.banned) {
      throw new ApiError(403, 'Account suspended. Please contact support.');
    }

    if (!currentUser.isActive) {
      throw new ApiError(403, 'Account is currently inactive.');
    }

    // 6. Grant Access: Attach user object to request
    req.user = currentUser;
    next();
  } catch (err) {
    // Specialized JWT error handling for the Frontend
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired, please login again'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token, access denied'));
    }
    next(err);
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

