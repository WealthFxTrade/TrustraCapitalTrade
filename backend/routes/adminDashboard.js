// routes/adminDashboard.js  (or adminStats.js / admin.js — choose a consistent name)
import express from 'express';
import asyncHandler from 'express-async-handler'; // ← highly recommended
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roleMiddleware.js'; // ← more flexible than isAdmin
import {
  getAdminStats,
  // getRecentActivity,      // optional future endpoints
  // getPlatformMetrics,
} from '../controllers/adminDashboardController.js';

const router = express.Router();

// Apply authentication + role check to **all** routes in this router
router.use(protect);

// Only admins (or superadmins) can access anything in this router
router.use(restrictTo('admin', 'superadmin')); // ← more extensible than single isAdmin

// ──────────────────────────────────────────────
// Core stats endpoint
// ──────────────────────────────────────────────
router.get(
  '/stats',
  asyncHandler(getAdminStats)
);

// Optional future endpoints (uncomment/add as you implement them)
// router.get('/activity', asyncHandler(getRecentActivity));
// router.get('/metrics', asyncHandler(getPlatformMetrics));
// router.get('/users', asyncHandler(getUserOverview));
// router.get('/deposits/pending', asyncHandler(getPendingDeposits));
// router.get('/withdrawals/pending', asyncHandler(getPendingWithdrawals));

export default router;
