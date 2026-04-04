// backend/middleware/authMiddleware.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * Protect routes: verifies JWT in cookies or Authorization header
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1️⃣ Check cookies first (Web)
  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  }
  // 2️⃣ Fallback: Authorization header (Mobile/Postman)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH ERROR] Token failed:', error.message);
    throw new ApiError(401, 'Not authorized, session expired');
  }
});

/**
 * Admin-only middleware
 */
export const admin = (req, res, next) => {
  if (!req.user) throw new ApiError(401, 'Not authorized');
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Admin access only');
  }
  next();
};
