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
    toggleUserBan,
    getSystemHealth, // 🛰️ Added
    getAuditLogs     // 🛰️ Added
} from '../controllers/adminController.js';

// ── SYSTEM METRICS ──
router.get('/stats', protect, admin, getAdminStats);
router.get('/health', protect, admin, getSystemHealth);
router.get('/audit-logs', protect, admin, getAuditLogs);

// ── USER MANAGEMENT ──
router.get('/users', protect, admin, getAllUsers);
// Standardized to match frontend 'api.put' calls
router.put('/user/:id/balance', protect, admin, updateUserBalance);
router.patch('/user/:id/toggle-ban', protect, admin, toggleUserBan);

// ── FINANCIAL AUDITS ──
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/withdrawal/:id', protect, admin, processWithdrawal);

// ── RIO PROTOCOL MANUAL TRIGGER ──
router.post('/trigger-roi', protect, admin, async (req, res) => {
    try {
        const count = await runYieldDistribution();
        res.status(200).json({
            success: true,
            message: `Rio Protocol Executed: ${count} nodes synchronized.`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Protocol stall.", error: err.message });
    }
});

export default router;
