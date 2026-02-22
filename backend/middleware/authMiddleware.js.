import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * @desc Protect routes - Verify JWT and check account status
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    // 2. Verify Token & Validate Payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Security Check: Ensure ID is a valid MongoDB ObjectId to prevent server crashes
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // 3. Fetch User and check permissions
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    // 4. Instant Kill-switch for Banned or Inactive accounts
    if (user.banned || (user.isActive === false)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Your account has been suspended' 
      });
    }

    // Attach user to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    
    // Distinguish between expired and malformed tokens for better UX
    const message = error.name === 'TokenExpiredError' 
      ? 'Session expired, please login again' 
      : 'Invalid or expired token';
      
    return res.status(401).json({ success: false, message });
  }
};

/**
 * @desc Admin only middleware
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Access denied: Admin permissions required' 
  });
};

/**
 * @desc Flexible role-based authorization (e.g., for 'moderator' or 'support' roles)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions for this action' 
      });
    }
    next();
  };
};

