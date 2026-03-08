// routes/userRoutes.js
import express from 'express';
const router = express.Router();

// ──────────────────────────────────────────────
// USER ROUTES
// All routes prefixed with: /api/user
// ──────────────────────────────────────────────

// ── AUTHENTICATION & PROTECTION ──
import { protect } from '../middleware/authMiddleware.js';

// ── CONTROLLERS ──
// Core user profile & financial operations
import {
  getUserProfile,
  updateProfile,
  getLedger,
  compoundYield,
  requestWithdrawal,
} from '../controllers/userController.js';

// Investment-related operations
import { subscribeToPlan } from '../controllers/investController.js';

// KYC verification
import { submitKyc } from '../controllers/kycController.js';

/**
 * @route   GET /api/user/profile
 * @desc    Get authenticated user's profile data
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/user/profile/update
 * @desc    Update user's profile information
 * @access  Private
 */
router.put('/profile/update', protect, updateProfile);

/**
 * @route   GET /api/user/ledger
 * @desc    Get user's transaction ledger / balance history
 * @access  Private
 */
router.get('/ledger', protect, getLedger);

/**
 * @route   POST /api/user/compound-yield
 * @desc    Compound (re-invest) realized ROI/yield back into principal
 * @access  Private
 */
router.post('/compound-yield', protect, compoundYield);

/**
 * @route   POST /api/user/invest
 * @desc    Activate/invest in a trading plan (Rio Starter, etc.)
 * @access  Private
 */
router.post('/invest', protect, subscribeToPlan);

/**
 * @route   POST /api/user/withdraw
 * @desc    Submit a withdrawal request
 * @access  Private
 */
router.post('/withdraw', protect, requestWithdrawal);

// Legacy route alias (for older frontend calls if any still exist)
router.post('/withdraw/request', protect, requestWithdrawal);

/**
 * @route   POST /api/user/kyc/submit
 * @desc    Submit KYC verification documents/data
 * @access  Private
 */
router.post('/kyc/submit', protect, submitKyc);

// ──────────────────────────────────────────────
// Optional: Add more user-related routes here
// Examples:
// router.get('/transactions', protect, getTransactions);
// router.post('/deposit/confirm', protect, confirmDeposit);
// router.get('/referrals', protect, getReferrals);
// ──────────────────────────────────────────────

export default router;
