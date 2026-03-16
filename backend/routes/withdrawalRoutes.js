/**
 * routes/withdrawalRoutes.js
 * Withdrawal-specific API routes for Trustra Capital
 * Handles user-initiated withdrawal requests, history retrieval,
 * and cancellation of pending withdrawals.
 *
 * All routes are protected (require authentication).
 * No admin-level withdrawal routes are defined here.
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

// Import controller functions from withdrawalController.js
import {
  requestWithdrawal,     // Initiate a new withdrawal request
  getMyWithdrawals,      // Get authenticated user's withdrawal history
  cancelWithdrawal,      // Cancel a pending withdrawal request
} from '../controllers/withdrawalController.js';

const router = express.Router();

// ── WITHDRAWAL PROTOCOL ROUTES ───────────────────────────────────────────────────────

// POST /api/withdrawal/request
// Initiate a withdrawal request (user submits amount, destination, etc.)
router.post(
  '/request',
  protect,                    // Requires authenticated user
  requestWithdrawal
);

// GET /api/withdrawal/history
// Retrieve the authenticated user's full withdrawal history
router.get(
  '/history',
  protect,
  getMyWithdrawals
);

// DELETE /api/withdrawal/cancel/:id
// Cancel a pending withdrawal request by its ID
// Only allowed if the withdrawal is still in 'pending' status
router.delete(
  '/cancel/:id',
  protect,
  cancelWithdrawal
);

export default router;
