import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getUsers, 
  updateUserBalance, 
  banUser 
} from '../controllers/userController.js';

// 🛑 FIX: Import the functions that exist in withdrawalController.js
import { 
  approveWithdrawal, 
  rejectWithdrawal, 
  getPendingWithdrawals 
} from '../controllers/withdrawalController.js';

const router = express.Router();

router.use(protect, admin);

// ... other routes ...

// ✅ FIX: Use the specific approve/reject routes
router.get('/withdrawals/pending', getPendingWithdrawals);
router.post('/withdrawals/approve', approveWithdrawal);
router.post('/withdrawals/reject', rejectWithdrawal);

export default router;

