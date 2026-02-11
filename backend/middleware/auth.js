
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

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate payload
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (user.banned || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account suspended. Contact support.",
      });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * 🛡️ ADMIN ONLY
 * Restrict access to users with admin role
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin permissions required.",
  });
};

/**
 * 🛡️ AUTHORIZE FLEXIBLE ROLES
 * Accepts multiple roles for granular permission control
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
