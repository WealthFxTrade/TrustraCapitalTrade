import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Protect middleware - verifies JWT from cookie (preferred) or Bearer header
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Priority 1: httpOnly cookie (most secure for web)
  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  }
  // Priority 2: Authorization header (for mobile/Postman)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - No token provided');
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] JWT_SECRET is missing from .env');
      res.status(500);
      throw new Error('Server configuration error');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized - Invalid token');
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized - User not found');
    }

    // Additional security checks
    if (user.isBanned) {
      res.status(403);
      throw new Error('Account has been banned');
    }

    if (user.isActive === false) {
      res.status(403);
      throw new Error('Account is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    let message = 'Not authorized - Invalid session';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }

    console.error('[AUTH ERROR]', error.message);
    res.status(401);
    throw new Error(message);
  }
});

/**
 * Admin-only middleware
 */
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied - Administrative privileges required');
  }
};
