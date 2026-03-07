import express from 'express';
const router = express.Router();

/**
 * 🔐 Middleware Imports
 */
import { protect, admin } from '../middleware/authMiddleware.js';

/**
 * 🎮 Controller Imports
 * Synchronized with adminController.js exports
 */
import {
  getUsers,
  updateUserBalance,
  getWithdrawals,      // Matches Controller
  processWithdrawal,   // Replaced 'updateWithdrawalStatus' to fix crash
  getSystemHealth,
  triggerManualRoi,
  getGlobalLedger,
} from '../controllers/adminController.js';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 👑 TRUSTRA ADMIN COMMAND CENTER
 * Prefix: /api/admin
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── 👤 IDENTITY & INVESTOR REGISTRY ──
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/balance', protect, admin, updateUserBalance);

// ── 💰 CAPITAL FLOW & WITHDRAWALS ──
router.get('/withdrawals', protect, admin, getWithdrawals);

// Process a withdrawal (Approve/Reject with auto-refund logic)
// Matched to processWithdrawal in controller
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

router.get('/ledger', protect, admin, getGlobalLedger);

// ── 🛰️ CORE INFRASTRUCTURE & AUTOMATION ──
router.get('/health', protect, admin, getSystemHealth);

// Manual override for the RIO Engine: Force yield distribution
router.post('/trigger-roi', protect, admin, triggerManualRoi);

export default router;
