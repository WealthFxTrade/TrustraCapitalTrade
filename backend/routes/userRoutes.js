import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

import {
  getUserProfile,
  updateProfile,
  getLedger,      // ⚡ Verified Export
  compoundYield,  // ⚡ Verified Export
  requestWithdrawal // ⚡ Verified Export
} from '../controllers/userController.js';

import { subscribeToPlan } from '../controllers/investController.js';
import { submitKyc } from '../controllers/kycController.js';
import { getTransactionHistory } from '../controllers/transactionController.js';

router.get('/profile', protect, getUserProfile);
router.put('/profile/update', protect, updateProfile);
router.get('/ledger', protect, getLedger);
router.get('/activity', protect, getTransactionHistory);
router.post('/compound-yield', protect, compoundYield);
router.post('/invest', protect, subscribeToPlan);
router.post('/withdraw', protect, requestWithdrawal);
router.post('/kyc/submit', protect, submitKyc);

export default router;

