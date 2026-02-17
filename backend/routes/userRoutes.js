// routes/userRoutes.js
import express from 'express';
import {
  getUserDashboard,
  getUserBalances,
  getUserLedger,
  updateUserProfile,
  approveDeposit,
  getUsers,
  updateUserBalance,
  banUser,
  unbanUser,
  // getUserById,          // ← add this once you implement it in controller
  // deleteUser,           // ← add this once implemented
  // verifyUserEmail,
  // resendVerificationEmail,
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ────────────── USER ROUTES (authenticated users only) ──────────────
router.get('/dashboard', protect, getUserDashboard);

router.route('/me')
  .get(protect, getUserDashboard)      // use dashboard as profile for now
  .put(protect, updateUserProfile);

router.get('/balance', protect, getUserBalances);
router.get('/transactions', protect, getUserLedger);

// Verification routes (if you implement them later)
// router.post('/verify/resend', protect, resendVerificationEmail);
// router.get('/verify/:token', verifyUserEmail);

// ────────────── ADMIN ROUTES (admin only) ──────────────
router.post('/approve-deposit', protect, admin, approveDeposit);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserDashboard)   // temporary – replace with getUserById when added
  .put(protect, admin, updateUserBalance)   // admin balance update
  .delete(protect, admin, () => res.status(501).json({ message: 'Delete not implemented yet' })); // placeholder

// Admin user actions
router.put('/:id/balance', protect, admin, updateUserBalance);
router.put('/:id/ban', protect, admin, banUser);
router.put('/:id/unban', protect, admin, unbanUser);

export default router;
