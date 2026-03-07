// routes/userRoutes.js
import express from 'express';
const router = express.Router();

// ── Middleware ──
// All user routes require authentication
import { protect } from '../middleware/authMiddleware.js';

// ── Controller Imports ──
// Profile & settings
import {
  getUserProfile,
  updateProfile,
} from '../controllers/userController.js';

// Ledger & yield
import {
  getLedger,         // Your own ledger (user-specific)
  compoundYield,     // Snowball / compounding protocol
} from '../controllers/userController.js';

// Investment & plans
import {
  subscribeToPlan,   // Activate Rio plan
} from '../controllers/investController.js';

// Withdrawal
import {
  requestWithdrawal, // Submit withdrawal request
} from '../controllers/withdrawalController.js';

// KYC
import {
  submitKyc,         // Upload KYC documents
} from '../controllers/kycController.js';

/**
 * ──────────────────────────────────────────────
 * USER ROUTES
 * Root Prefix: /api/user
 * Access Level: Private (Authenticated Users Only)
 * ──────────────────────────────────────────────
 */

// ── 1. IDENTITY & PROFILE ──
/**
 * @route   GET /api/user/profile
 * @desc    Get current user's profile details
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/user/profile/update
 * @desc    Update user profile (name, phone, etc.)
 * @access  Private
 * @body    { name?: string, phone?: string, username?: string }
 */
router.put('/profile/update', protect, updateProfile);

// ── 2. FINANCIAL LEDGER & YIELD ──
/**
 * @route   GET /api/user/ledger
 * @desc    Get user's own transaction history (ledger)
 * @access  Private
 * @query   ?limit=20&page=1&type=yield|deposit|withdrawal
 */
router.get('/ledger', protect, getLedger);

/**
 * @route   POST /api/user/compound-yield
 * @desc    Manually compound ROI yield into principal (Snowball Protocol)
 * @access  Private
 */
router.post('/compound-yield', protect, compoundYield);

// ── 3. INVESTMENT PROTOCOLS ──
/**
 * @route   POST /api/user/invest
 * @desc    Subscribe to a Rio investment plan
 * @access  Private
 * @body    { plan: string, amount: number }
 */
router.post('/invest', protect, subscribeToPlan);

// ── 4. EXTRACTION PROTOCOLS ──
/**
 * @route   POST /api/user/withdraw/request
 * @desc    Submit a withdrawal request
 * @access  Private
 * @body    { amount: number, vault: 'EUR'|'ROI', address?: string }
 */
router.post('/withdraw/request', protect, requestWithdrawal);

// ── 5. KYC VERIFICATION ──
/**
 * @route   POST /api/user/kyc/submit
 * @desc    Submit KYC documents for verification
 * @access  Private
 * @body    FormData with files (ID, selfie, etc.)
 */
router.post('/kyc/submit', protect, submitKyc);

export default router;
