/**
 * routes/transactions.js
 * Transaction and ledger routes for Trustra Capital
 * Provides endpoints for users to view their own transaction history (ledger)
 * and retrieve individual transaction details.
 * Admin-level routes are not included here (handled in separate admin routes).
 */

import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

// ── USER-SPECIFIC TRANSACTION ROUTES ─────────────────────────────────────────────────

// Get current user's full transaction history (ledger)
// Sorted newest first, limited to recent entries for performance
router.get(
  '/my',
  protect, // Requires authenticated user
  async (req, res, next) => {
    try {
      // Step 1: Fetch authenticated user and select only the ledger field
      const user = await User.findById(req.user.id).select('ledger');

      // Step 2: Validate user exists
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Step 3: Sort ledger entries by creation date (newest first)
      // Use spread operator to create a copy (avoid mutating original array)
      const sortedLedger = [...user.ledger].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Step 4: Return sorted transaction history
      res.status(200).json({
        success: true,
        count: sortedLedger.length,
        data: sortedLedger,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Legacy alias route – redirects to /my for backward compatibility
// Uses 307 Temporary Redirect to preserve method and body if any
router.get(
  '/',
  protect,
  async (req, res, next) => {
    // Redirect to the canonical user history endpoint
    res.redirect(307, '/api/transactions/my');
  }
);

// Get a single transaction detail by ID
// Only returns transaction if it belongs to the authenticated user
router.get(
  '/:id',
  protect,
  async (req, res, next) => {
    try {
      // Step 1: Fetch user and select ledger field
      const user = await User.findById(req.user.id).select('ledger');

      // Step 2: Validate user exists
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Step 3: Find transaction by ID within user's ledger array
      const transaction = user.ledger.id(req.params.id);

      // Step 4: Validate transaction exists and belongs to user
      if (!transaction) {
        throw new ApiError(404, 'Transaction not found or does not belong to you');
      }

      // Step 5: Return the transaction detail
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
