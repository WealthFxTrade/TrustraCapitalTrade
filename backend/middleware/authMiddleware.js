import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * @desc Protect routes - Verify JWT and check account status
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Header (Bearer schema)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, access token missing' 
      });
    }

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Security Check: Validate MongoDB ID format to prevent casting errors
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid security credentials' 
      });
    }

    // 4. Fetch User and check account state
    // We exclude the password for security, but we need role and status
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identity verification failed: User no longer exists' 
      });
    }

    // 5. Check if user is banned or inactive (Fintech Kill-switch)
    if (user.banned || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account restricted: Please contact support'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);

    const message = error.name === 'TokenExpiredError'
      ? 'Your session has expired. Please log in again.'
      : 'Authentication failed. Invalid token.';

    return res.status(401).json({ success: false, message });
  }
};

/**
 * @desc Admin only middleware
 */
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrative clearance required'
  });
};

/**
 * @desc Alias for 'protect' to support routes that import { auth }
 */
export const auth = protect;
