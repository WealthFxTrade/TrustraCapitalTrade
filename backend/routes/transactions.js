import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/transactions
 * @desc    Get current user's transaction history (ledger)
 * @access  Private
 */
router.get('/', verifyToken, async (req, res, next) => {
  try {
    // 1. Fetch user and only select the ledger field
    // We sort the ledger sub-documents in memory or use a slice if needed
    const user = await User.findById(req.user.id).select('ledger');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // 2. Sort transactions by date (newest first)
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
    
    // Find the specific transaction in the user's ledger array
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

