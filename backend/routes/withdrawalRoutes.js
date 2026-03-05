import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

// Import the controller functions
// Ensure these functions exist in your withdrawalController.js
import {
    requestWithdrawal,
    getMyWithdrawals,
    cancelWithdrawal
} from '../controllers/withdrawalController.js';

// ── WITHDRAWAL PROTOCOLS ──

// POST /api/withdrawal/request - Initiate a payout
router.post('/request', protect, requestWithdrawal);

// GET /api/withdrawal/history - Fetch user's payout history
router.get('/history', protect, getMyWithdrawals);

// DELETE /api/withdrawal/cancel/:id - Cancel a pending request
router.delete('/cancel/:id', protect, cancelWithdrawal);

export default router;
