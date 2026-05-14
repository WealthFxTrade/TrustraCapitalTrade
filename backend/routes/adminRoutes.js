// backend/routes/adminRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

import {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  triggerYieldDistribution,
  getPendingKYCs,
  updateKYCStatus,
  impersonateUser,
  getWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * 🔐 GLOBAL PRODUCTION PROTECTION GATEWAY
 * Restricts all sub-paths to authenticated, authorized administrators
 */
router.use(protect);
router.use(admin);

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 📊 PLATFORM STATS
 * ────────────────────────────────────────────────────────────────────────────
 */
// PRODUCTION FIX: Removed the redundant asyncHandler wrappers to prevent server-crashing duplication loops
router.get('/health', getPlatformStats);
router.get('/overview', getPlatformStats); // Central alignment fix
router.get('/metrics', getPlatformStats);  // Central alignment fix

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 👥 USER MANAGEMENT
 * ────────────────────────────────────────────────────────────────────────────
 */
router.get('/users', getAllUsers);
router.patch('/users/:id/verify', updateUserStatus);

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 💸 WITHDRAWAL ENGINE ROUTING NODES
 * ────────────────────────────────────────────────────────────────────────────
 */
// Get all pending operations records
router.get('/withdrawals/pending', getWithdrawalRequests);

// Approve withdrawal → triggers blockchain settlement engine
router.post('/withdrawals/:id/approve', approveWithdrawal);

// Reject withdrawal → returns capital reserves back into user balances pool
router.post('/withdrawals/:id/reject', rejectWithdrawal);

/**
 * ────────────────────────────────────────────────────────────────────────────
 * ⚙️ YIELD ENGINE SCHEDULER OVERRIDES
 * ────────────────────────────────────────────────────────────────────────────
 */
router.post('/yield/trigger', triggerYieldDistribution);

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 🪪 KYC SECURITY IDENTITY VALIDATIONS
 * ────────────────────────────────────────────────────────────────────────────
 */
router.get('/kyc/pending', getPendingKYCs);
// PRODUCTION FIX: Realigned signature paths to match parameter schema structures: /admin/kyc/:id
router.patch('/kyc/:userId', updateKYCStatus);

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 🎭 ADMIN IDENTITY IMPERSONATION NODES
 * ────────────────────────────────────────────────────────────────────────────
 */
router.post('/impersonate/:userId', impersonateUser);

export default router;

