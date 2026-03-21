// routes/userRoutes.js
// All user-related API endpoints – mounted under /api/user

import express from 'express';
const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateProfile,
  getLedger,
  compoundYield,
  requestWithdrawal,
} from '../controllers/userController.js';

import { subscribeToPlan } from '../controllers/investController.js';
import { submitKyc } from '../controllers/kycController.js';
import { getTransactionHistory } from '../controllers/transactionController.js';

// ────────────────────────────────────────────────────────────────────────────────
// PROFILE & ACCOUNT MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────────
router.get('/profile', protect, getUserProfile);
router.put('/profile/update', protect, updateProfile);

// ────────────────────────────────────────────────────────────────────────────────
// LEDGER & TRANSACTION HISTORY
// ────────────────────────────────────────────────────────────────────────────────
router.get('/ledger', protect, getLedger);
router.get('/activity', protect, getTransactionHistory);

// ────────────────────────────────────────────────────────────────────────────────
// YIELD COMPOUNDING & INVESTMENT
// ────────────────────────────────────────────────────────────────────────────────
router.post('/compound-yield', protect, compoundYield);
router.post('/invest', protect, subscribeToPlan);

// ────────────────────────────────────────────────────────────────────────────────
// WITHDRAWAL & KYC SUBMISSION
// ────────────────────────────────────────────────────────────────────────────────
router.post('/withdraw', protect, requestWithdrawal);
router.post('/kyc/submit', protect, submitKyc);

export default router;
