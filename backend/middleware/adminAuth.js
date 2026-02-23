import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Middleware to protect Trustra Administrative routes
 * Ensures user is authenticated and has the 'admin' role
 */
export const adminAuth = async (req, res, next) => {
  try {
    // 1. Extract Token from Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Trustra Security: Authorization token missing'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify JWT
    // Ensure JWT_SECRET is defined in your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find User & Validate Admin Status
    // ✅ Note: Using decoded.id or decoded._id based on your login controller
    const user = await User.findById(decoded.id || decoded._id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Node Error: Admin account not found'
      });
    }

    // ✅ Explicit Role Check
    if (user.role !== 'admin' || user.banned) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Trustra Administrative rights required'
      });
    }

    // 4. Attach & Proceed
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error.message);

    // Specific handling for expired tokens
    const message = error.name === 'TokenExpiredError'
      ? 'Session expired. Please re-login to Admin Panel.'
      : 'Trustra Security: Invalid or tampered token.';

    return res.status(401).json({
      success: false,
      message
    });
  }
};

