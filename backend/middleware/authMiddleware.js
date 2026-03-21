// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * 🔐 PROTECT MIDDLEWARE
 * Primary gatekeeper for private routes
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for 'trustra_token' in Cookies (Prioritized for Vercel)
  if (req.cookies && req.cookies.trustra_token) {
    token = req.cookies.trustra_token;
  }
  // 2. Fallback: Check Authorization Header (Prioritized for Mobile/Postman)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token found
  if (!token) {
    console.warn(`[AUTH] Access Denied: No token found for ${req.originalUrl}`);
    res.status(401);
    throw new Error('Not authorized - No token provided');
  }

  try {
    // 3. Verify Token
    // Ensure JWT_SECRET is correctly loaded from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Handle multiple ID formats (id vs userId) to prevent payload mismatches
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`[AUTH] Invalid Token Payload:`, decoded);
      res.status(401);
      throw new Error('Not authorized - Invalid token payload');
    }

    // 5. Fetch User (Excluding password)
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.error(`[AUTH] Token valid but User ${userId} no longer exists.`);
      res.status(401);
      throw new Error('Not authorized - User not found');
    }

    // 6. Security Check: Banned/Suspended Status
    if (user.isBanned || user.status === 'suspended') {
      res.status(403);
      throw new Error('Account suspended - Please contact support');
    }

    // 7. Attach User to Request Object
    req.user = user;
    next();

  } catch (error) {
    let message = 'Not authorized - Invalid session';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired - Please log in again';
      console.warn(`[AUTH] Expired token for user.`);
    } else if (error.name === 'JsonWebTokenError') {
      console.error(`[AUTH] JWT Signature Mismatch. Check JWT_SECRET in .env.`);
    }

    res.status(401);
    throw new Error(message);
  }
});

/**
 * 🛡️ ADMIN MIDDLEWARE
 * Restricts access to System Administrators
 */
export const admin = (req, res, next) => {
  const isAdminRole = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin');
  const isAdminFlag = req.user && req.user.isAdmin === true;

  if (isAdminRole || isAdminFlag) {
    next();
  } else {
    console.warn(`[AUTH] Admin Access Denied for: ${req.user?.email}`);
    res.status(403);
    throw new Error('Access denied - Administrative privileges required');
  }
};

// Aliases for compatibility with different route versions
export const auth = protect;
