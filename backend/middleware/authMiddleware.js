import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js';

/**
 * PROTECT: Main authentication middleware
 * Supports both Cookie-based and Header-based JWT extraction
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Cookies (Primary for Web Browser / Production)
  if (req.cookies && req.cookies.trustra_token) {
    token = req.cookies.trustra_token;
  }
  // 2. Check Authorization Header (Primary for Mobile / Dev testing)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.error('[AUTH] No valid token found in cookies or headers');
    throw new ApiError(401, 'Not authorized, secure token missing');
  }

  try {
    // Verify Token against JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to Request object (exclude sensitive password)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.error(`[AUTH] User ID ${decoded.id} not found in database`);
      throw new ApiError(401, 'User account no longer exists');
    }

    // Set the user on the request for subsequent controllers
    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH ERROR]:', error.message);
    // Standardize error message for frontend interceptors
    throw new ApiError(401, 'Not authorized, session expired');
  }
});

/**
 * ADMIN: Authorization middleware
 * Restricts access to specific administrative roles
 */
export const admin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized, login required');
  }

  // Check for admin or superadmin roles
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    throw new ApiError(403, 'Access denied: Administrative privileges required');
  }
  
  next();
};
