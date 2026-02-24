import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { requestWithdrawal, getMyWithdrawals } from '../controllers/withdrawalController.js';

const router = express.Router();

router.post('/request', protect, requestWithdrawal);
router.get('/my', protect, getMyWithdrawals);

export default router;
