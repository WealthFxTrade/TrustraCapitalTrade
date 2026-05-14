// backend/middleware/authMiddleware.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * ============================================================================
 * PROTECT MIDDLEWARE - Production Grade
 * ============================================================================
 * Validates JWT token from cross-origin cookie context or authorization header
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ── TOKEN EXTRACTION ──
  // Priority parsing path: Cross-origin secure cookie context → Authorization Bearer string
  if (req.cookies?.trustra_token) {
    token = req.cookies.trustra_token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    // PRODUCTION REALIGNMENT FIX: Added the array index [1] selector context
    // This extracts the raw token payload string from the "Bearer <token>" header value
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

    // PRODUCTION COOKIE FLUSH FIX:
    // This signature matches our login/register configuration exactly.
    // It guarantees browsers drop the token over Vercel/Render networks.
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      res.clearCookie('trustra_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    }

    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid authentication token.';

    throw new ApiError(401, message);
  }

  // ── USER VALIDATION ──
  // PRODUCTION MIGRATION FIX: Removed the `.lean()` mapping block context.
  // Downstream controller update methods rely natively on active mongoose model hooks.
  const user = await User.findById(decoded.id)
    .select('-password -twoFactorSecret -sessions');

  if (!user) {
    console.warn(`[AUTH] User profile absent for token footprint ID: ${decoded.id}`);

    // PRODUCTION COOKIE FLUSH FIX:
    // Ensures clean session invalidation across distinct domain infrastructures.
    res.clearCookie('trustra_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    throw new ApiError(401, 'Session invalid. Please log in again.');
  }

  // ── PRODUCTION SECURITY FIX: TOKEN VERSION ENFORCEMENT ──
  // Checks token session versions against live user data properties.
  // Instantly revokes access if a password change incremented tokenVersion.
  const currentTokenVersion = decoded.version || 0;
  const liveUserTokenVersion = user.tokenVersion || 0;

  if (currentTokenVersion < liveUserTokenVersion) {
    console.warn(`[AUTH] Token version mismatch for user ${user._id}. Revoking session states.`);
    
    res.clearCookie('trustra_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    throw new ApiError(401, 'Session invalidated due to credential modifications. Please log in again.');
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
 * ============================================================================
 * ADMIN MIDDLEWARE
 * ============================================================================
 * Restricts access to admin and superadmin roles
 */
// PRODUCTION FIX: Wrapped inside asyncHandler to safely pass execution errors to errorMiddleware
export const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const authorizedRoles = ['admin', 'superadmin'];

  if (!authorizedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'Admin access required');
  }

  next();
});

/**
 * ============================================================================
 * OPTIONAL: SUPER ADMIN ONLY
 * ============================================================================
 */
// PRODUCTION FIX: Wrapped inside asyncHandler to safely protect root admin route executions
export const superAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (req.user.role !== 'superadmin') {
    throw new ApiError(403, 'Super Admin access required');
  }

  next();
});

