import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * @desc Protect routes - Verify JWT and check account status
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in Cookies (Secure) or Authorization Header (Bearer)
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
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

    // 3. Security Check: Sync with the ID key used in generateToken ('userId')
    const userId = decoded.userId || decoded.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid security credentials'
      });
    }

    // 4. Fetch User and check account state
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identity verification failed: User no longer exists'
      });
    }

    // 5. Check if user is restricted (Matches User.js model fields)
    if (user.isBanned || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account restricted: Please contact support'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('🛡️ [Auth Middleware Error]:', error.message);

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
  // Check for both 'role' or 'isAdmin' for cross-version compatibility
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrative clearance required'
  });
};

/**
 * @desc Alias for 'protect' to support various route imports
 */
export const auth = protect;
