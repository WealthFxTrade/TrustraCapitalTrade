import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * 🛡️ PROTECT ROUTE
 * Verifies JWT, ensures user exists and is active
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract Token
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Validate payload
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // 4. Fetch user and EXCLUDE the system counter document
    const user = await User.findOne({ 
      _id: decoded.id, 
      isCounter: { $ne: true } // Ensures system documents aren't treated as users
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 5. Check account status
    if (user.banned || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account suspended. Contact support.",
      });
    }

    // 6. Attach user to request
    req.user = user; 
    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);
    
    // Explicit feedback for expired sessions
    const message = error.name === 'TokenExpiredError' 
      ? "Session expired. Please login again." 
      : "Invalid or expired token";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * 🛡️ ADMIN ONLY
 * Restrict access to users with admin role
 */
export const adminOnly = (req, res, next) => {
  // Check both 'role' string and the 'isAdmin' boolean we synced in the model
  if (req.user?.role === 'admin' || req.user?.isAdmin) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin permissions required.",
  });
};

/**
 * 🛡️ AUTHORIZE FLEXIBLE ROLES
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

