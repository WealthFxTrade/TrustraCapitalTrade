import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createDeposit } from '../controllers/depositController.js';

const router = express.Router();

// Create a deposit
router.post('/create', protect, createDeposit);

export default router;
