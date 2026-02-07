import express from 'express';
import { protect } from '../middleware/auth.js';
import { requestWithdrawal } from '../controllers/withdrawalController.js';

const router = express.Router();

router.post('/request', protect, requestWithdrawal);

export default router;

