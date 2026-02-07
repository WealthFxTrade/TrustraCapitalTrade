import express from 'express';
const router = express.Router();

// Import all the controllers we fixed
import { 
  getDashboardStats, 
  updateBalance, 
  addBonus 
} from '../controllers/adminController.js';

// Import your existing user controllers
import { getUsers, toggleBlock } from '../controllers/userController.js';

// Middlewares
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

/**
 * ALL ROUTES PROTECTED BY AUTH AND ADMIN MIDDLEWARE
 */
router.use(authMiddleware, adminMiddleware);

// 1. Global Platform Stats (The Overview Cards)
router.get('/stats', getDashboardStats);

// 2. User Management (The Table)
router.get('/users', getUsers);
router.post('/users/toggle-block', toggleBlock);

// 3. Financial Synchronization (The "Adjust Funds" & "+ Add Bonus" Logic)
router.post('/users/update-balance', updateBalance);
router.post('/users/add-bonus', addBonus);

export default router;

