import express from 'express';
// ✅ FIXED: Ensure these match your actual middleware filenames (e.g., auth.js or adminAuth.js)
import { protect } from '../middleware/auth.js'; 
import { adminAuth } from '../middleware/adminAuth.js'; 

import {
  getDashboardStats,
  updateBalance,
  getAuditLogs,
  getAllUsers,
  updateUserEntity,
  deleteUserEntity,
} from '../controllers/adminController.js';

import {
  getKycRequests,
  approveKyc,
  rejectKyc
} from '../controllers/adminKycController.js';

// ✅ ADDED: Import for the withdrawal processing logic
import { adminUpdateWithdrawal } from '../controllers/withdrawalController.js';

const router = express.Router();

/**
 * 🔒 SECURITY LAYER
 * protect: Verifies the JWT Token
 * adminAuth: Verifies the user.role === 'admin'
 */
router.use(protect, adminAuth);

// --- 📊 DASHBOARD & AUDIT ---
router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

// --- 👥 USER MANAGEMENT ---
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserEntity);
router.delete('/users/:id', deleteUserEntity);

// --- 💰 FINANCIAL MANAGEMENT ---
// Handles manual EUR and EUR_PROFIT adjustments
router.post('/users/update-balance', updateBalance);

// ✅ NEW: Handle Approval/Rejection of Withdrawals (Rio Series 2026)
router.patch('/withdrawals/:id/status', adminUpdateWithdrawal);

// --- 🛡️ KYC MANAGEMENT ---
router.get('/kyc', getKycRequests);
router.patch('/kyc/:id/approve', approveKyc);
router.patch('/kyc/:id/reject', rejectKyc);

export default router;

