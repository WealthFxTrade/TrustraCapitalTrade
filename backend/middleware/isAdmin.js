// backend/middleware/isAdmin.js
import User from '../models/User.js';

const isAdmin = async (req, res, next) => {
  try {
    // Assuming protect middleware already ran and added req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    const user = await User.findById(req.user._id).select('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Optional: attach full user or just role for convenience
    req.isAdmin = true;
    // req.user.role = user.role; // already there from protect

    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check',
    });
  }
};

export default isAdmin;
