import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Protect route
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    if (user.banned || !user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });

    req.user = user;
    next();
  } catch (error) {
    console.error('AUTH ERROR:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Admin only
export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin permissions required' });
};

// Flexible roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};
