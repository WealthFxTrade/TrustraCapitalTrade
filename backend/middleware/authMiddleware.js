// middleware/authMiddleware.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * @desc Authenticate user via JWT cookie and attach user object to req
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header first, fallback to cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.trustra_token) {
    token = req.cookies.trustra_token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  try {
    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user to req (excluding password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new ApiError(401, 'User not found');
    }

    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error.message);
    throw new ApiError(401, 'Not authorized, token failed');
  }
});

/**
 * @desc Admin-only access middleware
 */
export const admin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized');
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Admin access only');
  }

  next();
};
