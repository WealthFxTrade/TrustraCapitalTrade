import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getActiveInvestments, 
  activatePlan, 
  exchangeBtcToEur 
} from '../controllers/investmentController.js';

const router = express.Router();

// 👤 USER ACCESSIBLE ROUTES
router.post('/activate', protect, activatePlan);
router.post('/exchange', protect, exchangeBtcToEur);

// 🛡️ ADMIN ONLY ROUTES
router.get('/active', protect, admin, getActiveInvestments);

export default router;

