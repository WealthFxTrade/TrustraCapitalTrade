import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserStats } from '../controllers/userStatsController.js';

const router = express.Router();

// API root /api health check
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Trustra Capital Trade API running' });
});

// User stats (protected)
router.get('/user/stats', protect, getUserStats);

export default router;
