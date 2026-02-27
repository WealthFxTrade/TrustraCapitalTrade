import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/transactions/my
 * @desc    Get current user's transaction history (ledger)
 * @access  Private
 */
router.get('/my', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Sort newest first (non-mutating)
    const sortedLedger = [...user.ledger].sort((a, b) => b.createdAt - a.createdAt);

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
 * @desc    Alias for /my (legacy)
 * @access  Private
 */
router.get('/', protect, async (req, res, next) => {
  // Redirect to /my (keep consistent)
  res.redirect(307, '/api/transactions/my');
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction detail
 * @access  Private
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('ledger');
    const transaction = user?.ledger?.id(req.params.id);

    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
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
