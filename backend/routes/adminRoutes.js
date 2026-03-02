import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAdminStats
} from '../controllers/userController.js';
import {
  getAllWithdrawals,
  updateWithdrawalStatus,
  getActivityLogs
} from '../controllers/withdrawalController.js';

const router = express.Router();

// Intelligence Pulse
router.get('/stats', protect, admin, getAdminStats);
router.get('/activity-logs', protect, admin, getActivityLogs);

// Node Management
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id', protect, admin, updateUserStatus);
router.delete('/users/:id', protect, admin, deleteUser);

// Egress Control
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/withdrawals/:id/status', protect, admin, updateWithdrawalStatus);

export default router;

