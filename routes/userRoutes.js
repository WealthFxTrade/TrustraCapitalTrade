// backend/routes/userRoutes.js
import express from 'express';
const router = express.Router();

// Import controllers (create userController.js with these functions)
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

// @route   GET /api/users/profile
// @desc    Get logged-in user's profile
// @access  Private
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);           // update own profile (name, email, etc.)

// @route   GET /api/users/balances
// @desc    Get logged-in user's balances
// @access  Private
router.get('/balances', protect, getUserBalances);

// @route   GET /api/users/ledger
// @desc    Get logged-in user's transaction ledger
// @access  Private
router.get('/ledger', protect, getUserLedger);

// @route   POST /api/users/verify/resend
// @desc    Resend email verification token
// @access  Private (logged in but not verified)
router.post('/verify/resend', protect, resendVerificationEmail);

// @route   GET /api/users/verify/:token
// @desc    Verify email with token
// @access  Public (token-based)
router.get('/verify/:token', verifyUserEmail);

// ────────────────────────────────────────────────
// Admin-only Routes
// ────────────────────────────────────────────────

// @route   GET /api/users
// @desc    Get all users (paginated, filtered)
// @access  Admin
router.route('/')
  .get(protect, admin, getUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Admin
router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)             // update any user (role, plan, etc.)
  .delete(protect, admin, deleteUser);         // delete user

// @route   PUT /api/users/:id/balance
// @desc    Admin manual balance adjustment
// @access  Admin
router.put('/:id/balance', protect, admin, updateUserBalance);

// @route   PUT /api/users/:id/ban
// @desc    Ban a user
// @access  Admin
router.put('/:id/ban', protect, admin, banUser);

// @route   PUT /api/users/:id/unban
// @desc    Unban a user
// @access  Admin
router.put('/:id/unban', protect, admin, unbanUser);

export default router;
