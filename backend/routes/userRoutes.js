import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserStats,
  getLedger,
  compoundYield,
  requestWithdrawal,
  getUserProfile,
  updateUserProfile,
  getDepositAddress
} from '../controllers/userController.js';

/**
 * PROTECT ALL ROUTES BELOW
 * Every endpoint in this file requires a valid 'trustra_token'
 */
router.use(protect);

// Dashboard Metrics (Balances & Stats)
router.get('/stats', getUserStats);

// Audit Ledger (Transaction History)
router.get('/transactions', getLedger);

// Vault Services (Deposits & Withdrawals)
router.get('/deposit-address', getDepositAddress);
router.post('/withdraw', requestWithdrawal);

// Strategic Reinvestment (Yield Management)
router.post('/compound', compoundYield);

/**
 * PROFILE MANAGEMENT
 * .get() fetches the verified user data
 * .put() updates profile information
 */
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

export default router;
