// middleware/authMiddleware.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * =========================================
 * PROTECT MIDDLEWARE - Production Grade
 * =========================================
 * Validates JWT token from cookie (preferred) or Authorization header
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ── TOKEN EXTRACTION ──
  // Priority: Cookie → Authorization Bearer header
  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  let decoded;

  // ── JWT VERIFICATION ──
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error(`[AUTH] JWT verification failed: ${err.message}`);

    // Clear cookie on token issues to prevent stuck sessions
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      res.clearCookie('trustra_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });
    }

    const message = err.name === 'TokenExpiredError' 
      ? 'Session expired. Please log in again.' 
      : 'Invalid authentication token.';

    throw new ApiError(401, message);
  }

  // ── USER VALIDATION ──
  const user = await User.findById(decoded.id)
    .select('-password -twoFactorSecret -sessions') // Don't expose sensitive fields
    .lean(); // Use lean for better performance

  if (!user) {
    console.warn(`[AUTH] User not found for token ID: ${decoded.id}`);

    // Clear invalid session cookie
    res.clearCookie('trustra_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    throw new ApiError(401, 'Session invalid. Please log in again.');
  }

  // ── CHECK ACCOUNT STATUS ──
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  if (user.isBanned) {
    throw new ApiError(403, 'Account is banned');
  }

  // ── ATTACH USER TO REQUEST ──
  req.user = user;
  next();
});

/**
 * =========================================
 * ADMIN MIDDLEWARE
 * =========================================
 * Restricts access to admin and superadmin roles
 */
export const admin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const authorizedRoles = ['admin', 'superadmin'];

  if (!authorizedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'Admin access required');
  }

  next();
};

/**
 * =========================================
 * OPTIONAL: SUPER ADMIN ONLY
 * =========================================
 */
export const superAdmin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Super Admin access required');
  }

  next();
};
