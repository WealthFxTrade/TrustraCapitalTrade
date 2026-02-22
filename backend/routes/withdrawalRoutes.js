import express from 'express';
import { protect, admin } from '../middleware/auth.js'; // Ensure path is correct
import { 
  requestWithdrawal, 
  getPendingWithdrawals, 
  approveWithdrawal,
  rejectWithdrawal,
  getUserWithdrawals
} from '../controllers/withdrawalController.js';

const router = express.Router();

/**
 * 👤 USER ROUTES
 * These routes allow the logged-in user to manage their own payouts
 */
// 1. Submit a new withdrawal request (deducts from EUR_PROFIT)
router.post('/request', protect, requestWithdrawal);

// 2. Get the history of their own withdrawals
router.get('/my-history', protect, getUserWithdrawals);


/**
 * 🛡️ ADMIN ROUTES
 * These routes are restricted to users with the 'admin' role
 */
// 3. Get all 'pending' requests from all users
router.get('/admin/pending', protect, admin, getPendingWithdrawals);

// 4. Mark a withdrawal as 'completed' after sending BTC manually
router.post('/admin/approve', protect, admin, approveWithdrawal);

// 5. Reject a withdrawal and refund the user's balance
router.post('/admin/reject', protect, admin, rejectWithdrawal);

export default router;

