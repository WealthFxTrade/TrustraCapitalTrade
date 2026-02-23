import express from 'express';
import User from '../models/User.js';
import { protect as verifyToken } from '../middleware/auth.js'; // Ensure this matches your middleware export
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/transactions/my
 * @desc    NEW: Specific endpoint for the 2026 Dashboard Ledger Sync
 * @access  Private
 */
router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Sort transactions by date (newest first)
    const sortedLedger = user.ledger.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      count: sortedLedger.length,
      data: sortedLedger
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get current user's transaction history (ledger)
 * @access  Private
 */
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    if (!user) throw new ApiError(404, 'User not found');

    const sortedLedger = user.ledger.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      count: sortedLedger.length,
      data: sortedLedger
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get details of a single transaction
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    const transaction = user.ledger.id(req.params.id);

    if (!transaction) {
      throw new ApiError(404, 'Transaction record not found');
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
});

export default router;

