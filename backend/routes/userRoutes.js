import express from 'express';
import {
  getUserBalances,
  getRecentTransactions,
  getDepositAddress,
  compoundYield,
  syncLedger,
  requestWithdrawal,
  getWithdrawalHistory
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all user actions
router.use(protect);

router.get('/balances', getUserBalances);
router.get('/transactions/recent', getRecentTransactions);
router.get('/deposit-address', getDepositAddress);
router.get('/withdrawals', getWithdrawalHistory);

router.post('/compound', compoundYield);
router.post('/sync-ledger', syncLedger);
router.post('/withdraw', requestWithdrawal);

export default router;

