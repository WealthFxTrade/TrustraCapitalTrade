import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';

import {
    getAllUsers,
    updateUserBalance,
    getAllWithdrawals,
    processWithdrawal,
    toggleUserBan
} from '../controllers/adminController.js';

// ── ADMIN OVERRIDE PROTOCOLS ──

// User Management
router.get('/users', protect, admin, getAllUsers);
router.patch('/user/:id/balance', protect, admin, updateUserBalance);
router.patch('/user/:id/toggle-ban', protect, admin, toggleUserBan);

// Financial Audits
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

export default router;
