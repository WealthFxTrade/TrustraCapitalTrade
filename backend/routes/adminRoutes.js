/**
 * routes/adminRoutes.js
 * Admin-only API routes for Trustra Capital Command Center
 * Provides endpoints for user management, withdrawal processing,
 * system health monitoring, manual ROI triggers, and global ledger access.
 *
 * All routes require:
 *   - protect (authenticated user)
 *   - admin  (admin role check)
 */

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

// Import admin controller functions
import {
  getUsers,                  // List all users
  updateUserBalance,         // Manually adjust user balance
  getWithdrawals,            // Get all withdrawal requests
  processWithdrawal,         // Approve/reject withdrawals
  getSystemHealth,           // System metrics & status
  triggerManualRoi,          // Force manual ROI distribution
  getGlobalLedger,           // System-wide transaction ledger
} from '../controllers/adminController.js';

const router = express.Router();

// ── USER & IDENTITY MANAGEMENT ──────────────────────────────────────────────────────

// GET /api/admin/users
// Retrieve list of all registered users (paginated/filterable in controller)
router.get('/users', protect, admin, getUsers);

// PUT /api/admin/users/:id/balance
// Manually update a user's balance (admin override)
router.put('/users/:id/balance', protect, admin, updateUserBalance);

// ── CAPITAL FLOW & WITHDRAWAL PROCESSING ─────────────────────────────────────────────

// GET /api/admin/withdrawals
// Get all withdrawal requests (pending, completed, rejected)
router.get('/withdrawals', protect, admin, getWithdrawals);

// PATCH /api/admin/withdrawal/:id
// Process (approve/reject) a specific withdrawal request
// May trigger balance refund on rejection
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

// ── SYSTEM-WIDE LEDGER & OVERSIGHT ──────────────────────────────────────────────────

// GET /api/admin/ledger
// View global transaction ledger across all users
router.get('/ledger', protect, admin, getGlobalLedger);

// ── CORE INFRASTRUCTURE & AUTOMATION CONTROLS ───────────────────────────────────────

// GET /api/admin/health
// Get real-time system health metrics (DB, memory, uptime, etc.)
router.get('/health', protect, admin, getSystemHealth);

// POST /api/admin/trigger-roi
// Manually trigger ROI/yield distribution (override scheduler)
router.post('/trigger-roi', protect, admin, triggerManualRoi);

export default router;
