import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';

// Unified Admin Logic
import {
    getAdminStats,
    getAllUsers,
    updateUserBalance,
    getAllWithdrawals,
    processWithdrawal,
    getSystemHealth,
    getAuditLogs
} from '../controllers/adminController.js';

// KYC Logic (pointing to the verified kycController.js)
import { adminUpdateKyc } from '../controllers/kycController.js';

// ── SYSTEM METRICS ──
router.get('/stats', protect, admin, getAdminStats);
router.get('/health', protect, admin, getSystemHealth);
router.get('/audit-logs', protect, admin, getAuditLogs);

// ── USER MANAGEMENT ──
router.get('/users', protect, admin, getAllUsers);
router.put('/user/:id/balance', protect, admin, updateUserBalance);

// ── KYC OVERSIGHT ──
router.put('/kyc-verify', protect, admin, adminUpdateKyc);

// ── FINANCIAL AUDITS ──
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

export default router;
