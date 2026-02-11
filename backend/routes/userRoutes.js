import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getUserLedger,
  getUserBalances,
  approveDeposit,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserBalance,
  banUser,
  unbanUser,
  verifyUserEmail,
  resendVerificationEmail,
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ────────────── USER ROUTES ──────────────
router.get('/dashboard', protect, getUserDashboard);

router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/balance', protect, getUserBalances);
router.get('/transactions', protect, getUserLedger);

// Verification
router.post('/verify/resend', protect, resendVerificationEmail);
router.get('/verify/:token', verifyUserEmail);

// ────────────── ADMIN ROUTES ──────────────
router.post('/approve-deposit', protect, admin, approveDeposit);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Admin actions
router.put('/:id/balance', protect, admin, updateUserBalance);
router.put('/:id/ban', protect, admin, banUser);
router.put('/:id/unban', protect, admin, unbanUser);

export default router;
