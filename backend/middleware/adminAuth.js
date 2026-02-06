import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorMiddleware.js'; // Assuming you have this for consistency

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find User & Validate Admin Status
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Node Error: Admin account not found'
      });
    }

    if (user.role !== 'admin') {
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

