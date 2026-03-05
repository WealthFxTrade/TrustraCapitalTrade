import express from 'express';
const router = express.Router();

// Middleware
import { protect } from '../middleware/authMiddleware.js';

// Controller Imports
import { 
    getUserProfile, 
    updateProfile, 
    getLedger 
} from '../controllers/userController.js';

import { 
    subscribeToPlan 
} from '../controllers/investController.js';

import { 
    requestWithdrawal 
} from '../controllers/withdrawalController.js';

import { 
    submitKyc 
} from '../controllers/kycController.js';

/**
 * ── 1. IDENTITY & PROFILE ──
 * Accessing the user's private data node
 */
router.get('/profile', protect, getUserProfile);
router.put('/profile/update', protect, updateProfile);

/**
 * ── 2. FINANCIAL LEDGER ──
 * Retrieving historical transaction data (ROI, Yield, Deposits)
 */
router.get('/ledger', protect, getLedger);

/**
 * ── 3. INVESTMENT PROTOCOLS ──
 * Activating Rio Yield Nodes
 */
router.post('/invest/subscribe', protect, subscribeToPlan);

/**
 * ── 4. EXTRACTION PROTOCOLS ──
 * Requesting BTC/ETH/USDT withdrawals
 */
router.post('/withdraw/request', protect, requestWithdrawal);

/**
 * ── 5. KYC VERIFICATION ──
 * Uploading identity documents to Zurich HQ
 */
router.post('/kyc/submit', protect, submitKyc);

export default router;
