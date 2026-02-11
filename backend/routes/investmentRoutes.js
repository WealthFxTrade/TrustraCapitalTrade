import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getActiveInvestments, distributeProfit, activatePlan } from '../controllers/investmentController.js';

const router = express.Router();

// All routes protected & admin-only
router.use(protect, admin);

// List all active investments
router.get('/active', getActiveInvestments);

// Distribute daily profit manually
router.post('/distribute', distributeProfit);

// Activate a plan for a user
router.post('/activate', activatePlan);

export default router;
