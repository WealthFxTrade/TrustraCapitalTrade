import express from 'express';
import {
  getDashboardStats,
  updateBalance,
  getAuditLogs
} from '../controllers/adminController.js';
import {
  getKycRequests,
  approveKyc,
  rejectKyc
} from '../controllers/adminKycController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

/**
 * SECURITY NODE: All routes below are restricted to
 * Administrators with valid JWT Bearer tokens.
 */
router.use(protect, admin);

// --- 1. Global Intelligence ---
router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

// --- 2. Financial Management ---
router.post('/users/update-balance', updateBalance);

// --- 3. Compliance & KYC ---
router.get('/kyc', getKycRequests);
router.patch('/kyc/:id/approve', approveKyc);
router.patch('/kyc/:id/reject', rejectKyc);

export default router;

