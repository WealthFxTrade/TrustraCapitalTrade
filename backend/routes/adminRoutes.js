import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getAllUsers, 
  updateUserStatus, 
  deleteUser, 
  getAdminStats // Add this
} from '../controllers/userController.js';
import { 
  getAllWithdrawals, 
  updateWithdrawalStatus,
  getActivityLogs // Add this
} from '../controllers/withdrawalController.js';

const router = express.Router();

// --- 1. System Intelligence ---
router.get('/stats', protect, admin, getAdminStats);
router.get('/activity-logs', protect, admin, getActivityLogs);

// --- 2. User Node Management ---
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id', protect, admin, updateUserStatus); // Changed to PATCH for partial updates
router.delete('/users/:id', protect, admin, deleteUser);

// --- 3. Capital Extraction Control ---
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/withdrawals/:id', protect, admin, updateWithdrawalStatus);

export default router;
