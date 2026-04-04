// routes/transactions.js
import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

/**
 * @desc Get current user's transaction history
 */
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('ledger');
    if (!user) throw new ApiError(404, 'User not found');

    const sortedLedger = [...user.ledger].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      count: sortedLedger.length,
      data: sortedLedger,
    });
  })
);

/**
 * @desc Legacy root redirect to /my
 */
router.get('/', protect, (req, res) => {
  res.redirect(307, '/api/transactions/my');
});

/**
 * @desc Get single transaction by ID
 */
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('ledger');
    if (!user) throw new ApiError(404, 'User not found');

    const transaction = user.ledger.id(req.params.id);
    if (!transaction) throw new ApiError(404, 'Transaction not found or does not belong to you');

    res.status(200).json({ success: true, data: transaction });
  })
);

export default router;
