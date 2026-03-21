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

// User & Node Management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/balance', protect, admin, updateUserBalance);
router.put('/users/:id/plan', protect, admin, updateUserPlan);

// Extractions
router.get('/withdrawals', protect, admin, getWithdrawals);
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

// Oversight & Infrastructure
router.get('/ledger', protect, admin, getGlobalLedger);
router.get('/health', protect, admin, getSystemHealth);
router.post('/trigger-roi', protect, admin, triggerManualRoi);

export default router;

