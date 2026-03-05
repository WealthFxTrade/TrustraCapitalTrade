import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import { runYieldDistribution } from '../utils/profitEngine.js';

import {
    getAdminStats,
    getAllUsers,
    updateUserBalance,
    getAllWithdrawals,
    processWithdrawal,
    toggleUserBan
} from '../controllers/adminController.js';

// ── SYSTEM METRICS ──
router.get('/stats', protect, admin, getAdminStats);

// ── USER MANAGEMENT ──
router.get('/users', protect, admin, getAllUsers);
router.patch('/user/:id/balance', protect, admin, updateUserBalance);
router.patch('/user/:id/toggle-ban', protect, admin, toggleUserBan);

// ── FINANCIAL AUDITS ──
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

// ── RIO PROTOCOL MANUAL TRIGGER ──
/**
 * @desc Big Red Button to manually trigger ROI distribution
 */
router.post('/trigger-roi', protect, admin, async (req, res) => {
    try {
        await runYieldDistribution();
        res.status(200).json({ 
            success: true, 
            message: "Rio Node Yield successfully injected into user ledgers." 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Protocol execution failed.", 
            error: err.message 
        });
    }
});

export default router;
