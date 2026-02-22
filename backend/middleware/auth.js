import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * 🛡️ PROTECT ROUTE
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and ensure it's not the system counter
    const user = await User.findOne({
      _id: decoded.id,
      isCounter: { $ne: true }
    }).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.banned || !user.isActive) {
      return res.status(403).json({ success: false, message: "Account suspended." });
    }

    req.user = user;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' 
      ? "Session expired. Please login again." 
      : "Invalid token";
    return res.status(401).json({ success: false, message });
  }
};

/**
 * 🛡️ ADMIN MIDDLEWARE
 * Renamed to 'admin' to match your route imports: 
 * import { protect, admin } from '../middleware/auth.js';
 */
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin permissions required.",
  });
};

/**
 * 🛡️ ROLE AUTHORIZATION (Flexible)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied for this action",
      });
    }
    next();
  };
};

