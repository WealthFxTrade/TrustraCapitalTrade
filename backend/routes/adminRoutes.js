import express from 'express';
const router = express.Router();

// Middleware Imports
import { protect, admin } from '../middleware/authMiddleware.js';

// Controller Imports
import {
  getUsers,
  updateUserBalance,
  getWithdrawals,
  updateWithdrawalStatus,
  getSystemHealth,
  triggerManualRoi,
  getGlobalLedger
} from '../controllers/adminController.js';

/**
 * ── ADMIN COMMAND CENTER ROUTES ──
 * Root Prefix: /api/admin
 * Access Level: Private (Admin Only)
 */

// Identity & Node Management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/balance', protect, admin, updateUserBalance);

// Capital Flow Oversight
router.get('/withdrawals', protect, admin, getWithdrawals);
router.patch('/withdrawal/:id', protect, admin, updateWithdrawalStatus);
router.get('/ledger', protect, admin, getGlobalLedger);

// Infrastructure & Solvency
router.get('/system-health', protect, admin, getSystemHealth);
router.post('/trigger-roi', protect, admin, triggerManualRoi);

export default router;
