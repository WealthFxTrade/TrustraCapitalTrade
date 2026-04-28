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
  getDepositAddress,
  seedGeryBalances // Crucial import for balance seeding
} from '../controllers/userController.js';

// Protect all routes
router.use(protect);

// Dashboard & Ledger
router.get('/stats', getUserStats);
router.get('/ledger', getLedger);

// Vault & Reinvestment
router.get('/deposit-address', getDepositAddress);
router.post('/withdraw', requestWithdrawal);
router.post('/compound', compoundYield);

// Profile Management
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

// ✅ Special Endpoint for Gery Balance Seeding
router.post('/seed-gery', seedGeryBalances);

export default router;

