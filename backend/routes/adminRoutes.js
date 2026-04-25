import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, admin } from '../middleware/authMiddleware.js';

import {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  triggerYieldDistribution,
  getPendingKYCs,
  updateKYCStatus,
  impersonateUser,

  // ✅ ADD THESE
  getWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal

} from '../controllers/adminController.js';

const router = express.Router();

/**
 * 🔐 GLOBAL PROTECTION
 */
router.use(protect);
router.use(admin);

/**
 * ─────────────────────────────
 * 📊 PLATFORM STATS
 * ─────────────────────────────
 */
router.get('/health', asyncHandler(getPlatformStats));
router.get('/stats', asyncHandler(getPlatformStats));

/**
 * ─────────────────────────────
 * 👥 USER MANAGEMENT
 * ─────────────────────────────
 */
router.get('/users', asyncHandler(getAllUsers));
router.patch('/user/:id/:action', asyncHandler(updateUserStatus));

/**
 * ─────────────────────────────
 * 💸 WITHDRAWAL ENGINE (🔥 FIX)
 * ─────────────────────────────
 */

// Get all withdrawals
router.get('/withdrawals', asyncHandler(getWithdrawalRequests));

// Approve withdrawal → triggers blockchain send
router.put('/withdrawal/:id/approve', asyncHandler(approveWithdrawal));

// Reject withdrawal → refund user
router.put('/withdrawal/:id/reject', asyncHandler(rejectWithdrawal));

/**
 * ─────────────────────────────
 * ⚙️ YIELD ENGINE
 * ─────────────────────────────
 */
router.post('/yield/trigger', asyncHandler(triggerYieldDistribution));

/**
 * ─────────────────────────────
 * 🪪 KYC SYSTEM
 * ─────────────────────────────
 */
router.get('/kyc/pending', asyncHandler(getPendingKYCs));
router.patch('/kyc/update', asyncHandler(updateKYCStatus));

/**
 * ─────────────────────────────
 * 🎭 ADMIN IMPERSONATION
 * ─────────────────────────────
 */
router.post('/impersonate/:userId', asyncHandler(impersonateUser));

export default router;
