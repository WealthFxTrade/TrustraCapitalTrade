import express from 'express';
const router = express.Router();

// Import controllers
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBalances,
  updateUserBalance,
  getUserLedger,
  banUser,
  unbanUser,
  verifyUserEmail,
  resendVerificationEmail,
} from '../controllers/userController.js';

// Import middlewares
import { protect, admin } from '../middleware/authMiddleware.js';

// ────────────────────────────────────────────────
// Public / Authenticated User Routes
// ────────────────────────────────────────────────

/**
 * @route   GET & PUT /api/user/me
 * @desc    Get or Update logged-in user's profile
 * FIX: Path changed from '/profile' to '/user/me' to match frontend
 */
router.route('/user/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

/**
 * @route   GET /api/user/balance
 * FIX: Path changed from '/balances' to '/user/balance' for frontend consistency
 */
router.get('/user/balance', protect, getUserBalances);

/**
 * @route   GET /api/transactions/my
 * FIX: Path kept as '/transactions/my' to match your app.js mounting logic
 */
router.get('/transactions/my', protect, getUserLedger);

// Email Verification
router.post('/verify/resend', protect, resendVerificationEmail);
router.get('/verify/:token', verifyUserEmail);

// ────────────────────────────────────────────────
// Admin-only Routes (Prefix remains /api/users via app.js)
// ────────────────────────────────────────────────

// @route   GET /api/users
router.route('/users')
  .get(protect, admin, getUsers);

// @route   GET/PUT/DELETE /api/users/:id
router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Admin Actions
router.put('/users/:id/balance', protect, admin, updateUserBalance);
router.put('/users/:id/ban', protect, admin, banUser);
router.put('/users/:id/unban', protect, admin, unbanUser);

export default router;

