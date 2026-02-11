import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
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

const router = express.Router();

// Protect all admin routes
router.use(protect, admin);

// Dashboard & audit logs
router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserEntity);
router.delete('/users/:id', deleteUserEntity);

// Financial management
router.post('/users/update-balance', updateBalance);

// KYC management
router.get('/kyc', getKycRequests);
router.patch('/kyc/:id/approve', approveKyc);
router.patch('/kyc/:id/reject', rejectKyc);

export default router;
