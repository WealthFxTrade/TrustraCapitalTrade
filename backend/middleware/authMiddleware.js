// backend/middleware/authMiddleware.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * ============================================================================
 * PROTECT MIDDLEWARE - Production Grade
 * ============================================================================
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Priority: Cookie → Authorization Header
  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error(`[AUTH] JWT Error: ${err.message}`);

    // Clear invalid/expired cookie
    res.clearCookie('trustra_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid authentication token.';

    throw new ApiError(401, message);
  }

  // Fetch user
  const user = await User.findById(decoded.id)
    .select('-password -resetPasswordToken -resetPasswordExpire');

  if (!user) {
    res.clearCookie('trustra_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    throw new ApiError(401, 'User not found. Please log in again.');
  }

  // Token Version Check (Important for password change logout)
  const currentTokenVersion = decoded.version || 0;
  const liveTokenVersion = user.tokenVersion || 0;

  if (currentTokenVersion < liveTokenVersion) {
    res.clearCookie('trustra_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    throw new ApiError(401, 'Session invalidated. Please log in again.');
  }

  // Account Status Checks
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated.');
  }

  if (user.isBanned) {
    throw new ApiError(403, 'Your account has been banned.');
  }

  // Attach user to request
  req.user = user;
  next();
});

/**
 * ============================================================================
 * ADMIN MIDDLEWARE
 * ============================================================================
 */
export const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Admin access required');
  }

  next();
});

/**
 * ============================================================================
 * SUPER ADMIN MIDDLEWARE
 * ============================================================================
 */
export const superAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Super Admin access required');
  }

  next();
});
