import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @protocol getUserProfile
 * @desc    Retrieves full user node data, including balance maps and kyc status
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      throw new ApiError(404, "User node not found in registry.");
    }

    // Convert the Mongoose Map to a standard Object for the frontend
    const balancesObject = Object.fromEntries(user.balances);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        activePlan: user.activePlan,
        totalBalance: user.totalBalance, // Total Principal Invested
        totalProfit: user.totalProfit,   // Cumulative ROI earned
        balances: balancesObject,        // Current wallet states (EUR, BTC, ROI, etc.)
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @protocol getLedger
 * @desc    Fetches the immutable transaction history for the user
 */
export const getLedger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('ledger');
    
    // Sort ledger by newest first
    const sortedLedger = user.ledger.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      ledger: sortedLedger
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @protocol updateProfile
 * @desc    Allows users to update basic metadata (non-financial)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    
    // Safety check: Never allow balance updates through this endpoint
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile node updated successfully.",
      user: {
        username: updatedUser.username,
        email: updatedUser.email
      }
    });
  } catch (err) {
    next(err);
  }
};
