import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requestWithdrawal, cancelWithdrawal } from '../controllers/withdrawalController.js';

const router = express.Router();

// Request withdrawal
router.post('/request', protect, requestWithdrawal);

// Cancel withdrawal
router.post('/cancel/:id', protect, cancelWithdrawal);

export default router;
