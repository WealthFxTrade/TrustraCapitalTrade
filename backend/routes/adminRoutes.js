// routes/adminRoutes.js - FULLY CORRECTED VERSION
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  updateUserBalance,
  getWithdrawals,
  processWithdrawal,
  getSystemHealth,
  triggerManualRoi,
  getGlobalLedger,
  updateUserPlan
} from '../controllers/adminController.js';

const router = express.Router();

// ── PUBLIC HEALTH CHECK (No auth required for keep-alive) ─────────────────────
router.get('/health', getSystemHealth);   // ← Made public

// ── PROTECTED ADMIN ROUTES ───────────────────────────────────────────────────
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/balance', protect, admin, updateUserBalance);
router.put('/users/:id/plan', protect, admin, updateUserPlan);

router.get('/withdrawals', protect, admin, getWithdrawals);
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

router.get('/ledger', protect, admin, getGlobalLedger);
router.post('/trigger-roi', protect, admin, triggerManualRoi);

export default router;
