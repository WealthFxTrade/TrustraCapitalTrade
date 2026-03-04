import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  requestWithdrawal, 
  getMyWithdrawals 
} from '../controllers/withdrawalController.js';

const router = express.Router();

router.use(protect); // Ensure user is logged in

router.post('/request', requestWithdrawal);
router.get('/my', getMyWithdrawals);

export default router;
