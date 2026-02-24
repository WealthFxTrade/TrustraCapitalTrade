import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createInvestment, getMyInvestments } from '../controllers/investmentController.js';

const router = express.Router();

router.post('/invest', protect, createInvestment);
router.get('/my', protect, getMyInvestments);

export default router;
