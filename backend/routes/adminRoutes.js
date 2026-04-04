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
  impersonateUser
} from '../controllers/adminController.js';

const router = express.Router();

// ── PROTECTION & ADMIN MIDDLEWARE ──
router.use(protect);  // Ensures user is logged in
router.use(admin);    // Ensures user is admin

// ── PLATFORM STATS / HEALTH ──
/**
 * @desc Get platform health and AUM stats
 * @route GET /api/admin/health
 */
router.get('/health', asyncHandler(getPlatformStats));

/**
 * @desc Alias route for health stats
 * @route GET /api/admin/stats
 */
router.get('/stats', asyncHandler(getPlatformStats));

// ── USERS MANAGEMENT ──
/**
 * @desc Get all registered users (Admin-only)
 * @route GET /api/admin/users
 */
router.get('/users', asyncHandler(getAllUsers));

/**
 * @desc Update user status (ban or activate)
 * @route PATCH /api/admin/user/:id/:action
 */
router.patch('/user/:id/:action', asyncHandler(updateUserStatus));

// ── YIELD / INVESTMENT MANAGEMENT ──
/**
 * @desc Trigger global yield distribution
 * @route POST /api/admin/yield/trigger
 */
router.post('/yield/trigger', asyncHandler(triggerYieldDistribution));

// ── KYC MANAGEMENT ──
/**
 * @desc Get pending KYC submissions
 * @route GET /api/admin/kyc/pending
 */
router.get('/kyc/pending', asyncHandler(getPendingKYCs));

/**
 * @desc Update KYC status of a user
 * @route PATCH /api/admin/kyc/update
 */
router.patch('/kyc/update', asyncHandler(updateKYCStatus));

// ── ADMIN IMPERSONATION ──
/**
 * @desc Securely impersonate a user
 * @route POST /api/admin/impersonate/:userId
 */
router.post('/impersonate/:userId', asyncHandler(impersonateUser));

export default router;
