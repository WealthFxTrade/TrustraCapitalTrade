import express from 'express';
const router = express.Router();

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

// ────────────────────────────────────────────────
// User Routes (Authenticated)
// ────────────────────────────────────────────────

// @route   GET /api/user/dashboard
router.get('/user/dashboard', protect, getUserDashboard);

// @route   GET /api/user/me
router.route('/user/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// @route   GET /api/user/balance
router.get('/user/balance', protect, getUserBalances);

// @route   GET /api/transactions/my
router.get('/transactions/my', protect, getUserLedger);

// Verification
router.post('/verify/resend', protect, resendVerificationEmail);
router.get('/verify/:token', verifyUserEmail);

// ────────────────────────────────────────────────
// Admin Routes (Admin Only)
// ────────────────────────────────────────────────

// @route   POST /api/users/approve-deposit
router.post('/users/approve-deposit', protect, admin, approveDeposit);

// @route   GET /api/users
router.route('/users')
  .get(protect, admin, getUsers);

// @route   GET/PUT/DELETE /api/users/:id
router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Management
router.put('/users/:id/balance', protect, admin, updateUserBalance);
router.put('/users/:id/ban', protect, admin, banUser);
router.put('/users/:id/unban', protect, admin, unbanUser);

export default router;

